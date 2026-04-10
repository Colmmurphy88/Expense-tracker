#!/usr/bin/env python3
"""Weekly Macro Economic Briefing — main orchestrator.

Researches macro developments for configured countries using Claude with
web search, then emails a formatted summary.
"""

import json
import smtplib
import sys
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import anthropic

import config
from email_template import build_html, build_plain_text, subject_line


# ── Research ─────────────────────────────────────────────────────────────────


def research_country(client: anthropic.Anthropic, country: str) -> dict:
    """Call Claude with web search to get macro highlights for *country*.

    Returns a dict: {"country": "...", "bullets": [{"text": "...", "url": "..."}]}
    Raises on failure so the caller can retry.
    """
    industries_list = ", ".join(config.INDUSTRIES)
    user_prompt = (
        f"Search for the most significant macro economic developments in "
        f"{country} from the past 7 days. Cover these industries: {industries_list}. "
        f"Return exactly 3 bullet points — the 3 most important developments across "
        f"those industries. Each bullet must include a source URL.\n\n"
        f'Respond ONLY with valid JSON in this exact format:\n'
        f'{{"country": "{country}", "bullets": ['
        f'{{"text": "...", "url": "..."}}, '
        f'{{"text": "...", "url": "..."}}, '
        f'{{"text": "...", "url": "..."}}]}}'
    )

    response = client.messages.create(
        model=config.MODEL,
        max_tokens=1024,
        system=config.SYSTEM_PROMPT,
        tools=[{"type": "web_search_20250305", "name": "web_search"}],
        messages=[{"role": "user", "content": user_prompt}],
    )

    # Extract text from response content blocks
    text_parts = []
    for block in response.content:
        if block.type == "text":
            text_parts.append(block.text)

    raw_text = " ".join(text_parts).strip()

    # Strip markdown fences if present
    if raw_text.startswith("```"):
        lines = raw_text.split("\n")
        # Remove first and last fence lines
        lines = [l for l in lines if not l.strip().startswith("```")]
        raw_text = "\n".join(lines).strip()

    data = json.loads(raw_text)

    # Validate structure
    if "bullets" not in data or not isinstance(data["bullets"], list):
        raise ValueError(f"Unexpected JSON structure for {country}: {data}")

    data["country"] = country
    return data


def research_all_countries(client: anthropic.Anthropic) -> tuple[list[dict], list[str]]:
    """Research every country in config.COUNTRIES.

    Returns (results, failures) where failures is a list of country names
    that could not be retrieved after retries.
    """
    results = []
    failures = []

    for i, country in enumerate(config.COUNTRIES):
        if i > 0:
            time.sleep(config.DELAY_BETWEEN_CALLS)

        success = False
        for attempt in range(1, config.MAX_RETRIES + 1):
            try:
                print(f"Researching {country}... ", end="", flush=True)
                data = research_country(client, country)
                results.append(data)
                print("done")
                success = True
                break
            except Exception as exc:
                print(f"attempt {attempt} failed: {exc}")
                if attempt < config.MAX_RETRIES:
                    time.sleep(config.DELAY_BETWEEN_CALLS)

        if not success:
            print(f"SKIPPING {country} after {config.MAX_RETRIES} failed attempts")
            failures.append(country)

    return results, failures


# ── Email ────────────────────────────────────────────────────────────────────


def send_email(results: list[dict], failures: list[str]) -> None:
    """Build and send the briefing email to all recipients."""
    recipients = [
        addr
        for addr in [config.EMAIL_TO_GMAIL, config.EMAIL_TO_OUTLOOK]
        if addr
    ]
    if not recipients:
        print("WARNING: No email recipients configured — skipping send.")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject_line()
    msg["From"] = config.GMAIL_ADDRESS
    msg["To"] = ", ".join(recipients)

    plain = build_plain_text(results, failures)
    html = build_html(results, failures)

    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html, "html"))

    print(f"Sending email to {', '.join(recipients)}... ", end="", flush=True)
    with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT) as server:
        server.starttls()
        server.login(config.GMAIL_ADDRESS, config.GMAIL_APP_PASSWORD)
        server.sendmail(config.GMAIL_ADDRESS, recipients, msg.as_string())
    print("sent")


# ── Main ─────────────────────────────────────────────────────────────────────


def main() -> None:
    if not config.ANTHROPIC_API_KEY:
        print("ERROR: ANTHROPIC_API_KEY is not set.")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)

    print("=== Weekly Macro Economic Briefing ===\n")
    results, failures = research_all_countries(client)

    if not results:
        print("ERROR: All country lookups failed. No email sent.")
        sys.exit(1)

    print(f"\nResearched {len(results)} countries successfully.")
    if failures:
        print(f"Failed countries: {', '.join(failures)}")

    send_email(results, failures)
    print("\nDone.")


if __name__ == "__main__":
    main()
