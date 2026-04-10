# Weekly Macro Economic Briefing

Automated weekly macro economic briefing system that uses Claude AI with web search to research current developments across 10 European countries and 5 industries, then emails you a formatted summary every Monday morning.

## How It Works

1. For each configured country, the script calls the Anthropic API with web search enabled
2. Claude searches the web for the most significant macro economic developments from the past 7 days
3. Results are compiled into a clean HTML email with source links
4. The email is sent via Gmail SMTP to your configured recipients

## Countries Covered

Italy, Spain, Portugal, Sweden, Denmark, Norway, Finland, Belgium, Netherlands, Luxembourg

## Industries Monitored

Financial Services, Healthcare / Pharma, Tech / SaaS, E-commerce / Retail, Manufacturing

## Setup

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Get an Anthropic API key

Sign up at [console.anthropic.com](https://console.anthropic.com) and create an API key.

### 3. Set up Gmail App Password

1. Enable 2-Factor Authentication on your Gmail account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate a new app password for "Mail"
4. Copy the 16-character password

### 4. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```
ANTHROPIC_API_KEY=sk-ant-...
GMAIL_ADDRESS=you@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
EMAIL_TO_GMAIL=you@gmail.com
EMAIL_TO_OUTLOOK=you@outlook.com
```

## Run Locally

```bash
python macro_briefing.py
```

The script will log progress to stdout and send the email when complete.

## Deploy with GitHub Actions

1. Push this repo to GitHub
2. Go to **Settings > Secrets and variables > Actions**
3. Add these repository secrets:
   - `ANTHROPIC_API_KEY`
   - `GMAIL_ADDRESS`
   - `GMAIL_APP_PASSWORD`
   - `EMAIL_TO_GMAIL`
   - `EMAIL_TO_OUTLOOK`
4. The workflow runs automatically every Monday at 7:00 AM UTC
5. You can also trigger it manually from the **Actions** tab

## Customization

### Add or remove countries

Edit the `COUNTRIES` list in `config.py`:

```python
COUNTRIES = [
    "Italy",
    "Spain",
    # Add more countries here...
]
```

### Add or remove industries

Edit the `INDUSTRIES` list in `config.py`:

```python
INDUSTRIES = [
    "Financial Services",
    "Healthcare / Pharma",
    # Add more industries here...
]
```

### Change the schedule

Edit the cron expression in `.github/workflows/weekly-briefing.yml`:

```yaml
schedule:
  - cron: '0 7 * * 1'  # Every Monday at 7:00 AM UTC
```

### Change the AI model

Edit `MODEL` in `config.py`:

```python
MODEL = "claude-sonnet-4-20250514"
```
