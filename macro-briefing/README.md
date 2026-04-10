# Weekly Macro Economic Briefing

Automated weekly macro economic research system powered by Claude AI. Every Monday morning it searches the web for the most significant economic developments across 10 European countries and 5 industries, then emails you a formatted summary.

## How it works

1. **Research** — For each country, Claude uses web search to find the 3 most important macro economic developments from the past 7 days
2. **Format** — Results are assembled into a clean HTML email with source links
3. **Deliver** — The email is sent via Gmail SMTP to your configured recipients

## Countries covered

Italy, Spain, Portugal, Sweden, Denmark, Norway, Finland, Belgium, Netherlands, Luxembourg

## Industries monitored

Financial Services, Healthcare / Pharma, Tech / SaaS, E-commerce / Retail, Manufacturing

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/Colmmurphy88/macro-briefing.git
cd macro-briefing
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Get your API keys

- **Anthropic API key** — Sign up at [console.anthropic.com](https://console.anthropic.com)
- **Gmail App Password** — Go to [Google Account > Security > 2-Step Verification > App passwords](https://myaccount.google.com/apppasswords) and generate a 16-character app password

### 4. Configure environment variables

Copy the example and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
GMAIL_ADDRESS=you@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
EMAIL_TO_GMAIL=you@gmail.com
EMAIL_TO_OUTLOOK=you@outlook.com
```

## Run locally

```bash
python macro_briefing.py
```

The script will research each country (with progress logging) and then email the results. Typical runtime is 2–4 minutes.

## Deploy with GitHub Actions

1. Push this repo to GitHub
2. Go to **Settings > Secrets and variables > Actions**
3. Add these repository secrets:
   - `ANTHROPIC_API_KEY`
   - `GMAIL_ADDRESS`
   - `GMAIL_APP_PASSWORD`
   - `EMAIL_TO_GMAIL`
   - `EMAIL_TO_OUTLOOK`
4. The workflow runs automatically every Monday at 07:00 UTC
5. You can also trigger it manually from the **Actions** tab

## Customise

### Add or remove countries

Edit the `COUNTRIES` list in `config.py`:

```python
COUNTRIES = [
    "Italy",
    "Spain",
    # Add more here...
]
```

### Add or remove industries

Edit the `INDUSTRIES` list in `config.py`:

```python
INDUSTRIES = [
    "Financial Services",
    "Healthcare / Pharma",
    # Add more here...
]
```

### Change the schedule

Edit the cron expression in `.github/workflows/weekly-briefing.yml`:

```yaml
schedule:
  - cron: '0 7 * * 1'  # Mon 07:00 UTC
```

### Add more recipients

Add new `EMAIL_TO_*` environment variables and include them in the recipients list in `macro_briefing.py`.
