"""Main orchestrator for the weekly macro economic briefing."""

import json
import re
import smtplib
import sys
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import anthropic

import config
from email_template import build_html, build_plain_text, build_subject


def research_country(client: anthropic.Anthropic, country: str) -> dict:
    """Call Claude with web search to get macro developments for a country.

    Returns {"country": "...", "bullets": [{"text": "...", "url": "..."}]}
    Raises on failure after retries.
    """
    industries_str = ", ".join(config.INDUSTRIES)
    user_prompt = (
        f"Search for the most significant macro economic developments in {country} "
        f"from the past 7 days. Cover these industries: {industries_str}. "
        f"Return exactly 3 bullet points — the 3 most important developments across "
        f"those industries. Each bullet must include a source URL. "
        f'Respond as JSON: {{"country": "{country}", "bullets": [{{"text": "...", "url": "..."}}]}}'
    )

    max_retries = 2
    for attempt in range(max_retries + 1):
        try:
            response = client.messages.create(
                model=config.MODEL,
                max_tokens=1024,
                system=config.SYSTEM_PROMPT,
                tools=[{"type": "web_search_20250305", "name": "web_search"}],
                messages=[{"role": "user", "content": user_prompt}],
            )

            # Extract text from the response content blocks
            text_content = ""
            for block in response.content:
                if block.type == "text":
                    text_content += block.text

            if not text_content:
                raise ValueError("No text content in response")

            # Strip markdown fences if present
            cleaned = text_content.strip()
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
            cleaned = re.sub(r"\s*```$", "", cleaned)
            cleaned = cleaned.strip()

            data = json.loads(cleaned)

            # Validate structure
            if "bullets" not in data or not isinstance(data["bullets"], list):
                raise ValueError("Response missing 'bullets' array")

            # Ensure exactly 3 bullets (take first 3 if more, pad if fewer)
            data["country"] = country
            data["bullets"] = data["bullets"][:3]

            return data

        except (anthropic.RateLimitError, anthropic.APIStatusError) as e:
            # Handle rate limits (429) and overloaded (529) with backoff
            if attempt < max_retries:
                wait = 30 * (attempt + 1)  # 30s, then 60s
                print(f"  API error, waiting {wait}s before retry {attempt + 1}/{max_retries}...")
                time.sleep(wait)
            else:
                raise
        except Exception as e:
            if attempt < max_retries:
                print(f"  Retry {attempt + 1}/{max_retries} for {country}: {e}")
                time.sleep(5)
            else:
                raise


def send_email(subject: str, html_body: str, plain_body: str) -> None:
    """Send the briefing email via Gmail SMTP."""
    if not config.GMAIL_ADDRESS or not config.GMAIL_APP_PASSWORD:
        print("ERROR: Gmail credentials not configured. Skipping email send.")
        return

    recipients = [r for r in config.EMAIL_RECIPIENTS if r]
    if not recipients:
        print("ERROR: No email recipients configured. Skipping email send.")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = config.GMAIL_ADDRESS
    msg["To"] = ", ".join(recipients)

    msg.attach(MIMEText(plain_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(config.GMAIL_ADDRESS, config.GMAIL_APP_PASSWORD)
        server.sendmail(config.GMAIL_ADDRESS, recipients, msg.as_string())

    print(f"Email sent to: {', '.join(recipients)}")


def main() -> None:
    if not config.ANTHROPIC_API_KEY:
        print("ERROR: ANTHROPIC_API_KEY not set.")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)

    results = []
    failures = []

    for i, country in enumerate(config.COUNTRIES):
        print(f"Researching {country}...", end=" ", flush=True)
        try:
            data = research_country(client, country)
            results.append(data)
            print("done")
        except Exception as e:
            print(f"FAILED ({e})")
            failures.append(country)

        # Rate-limit delay between calls (skip after last).
        # Web search responses are token-heavy; 45s keeps us under typical
        # per-minute token limits.
        if i < len(config.COUNTRIES) - 1:
            time.sleep(45)

    if not results:
        print("ERROR: All countries failed. No email sent.")
        sys.exit(1)

    print(f"\nCollected data for {len(results)}/{len(config.COUNTRIES)} countries.")
    if failures:
        print(f"Failed: {', '.join(failures)}")

    subject = build_subject()
    html_body = build_html(results, failures)
    plain_body = build_plain_text(results, failures)

    print(f"\nSending email: {subject}")
    send_email(subject, html_body, plain_body)
    print("Done.")


if __name__ == "__main__":
    main()
