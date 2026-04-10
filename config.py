"""Configuration for the weekly macro economic briefing."""

import os
from dotenv import load_dotenv

load_dotenv()

# Countries to cover (each gets its own section in the email)
COUNTRIES = [
    "Italy",
    "Spain",
    "Portugal",
    "Sweden",
    "Denmark",
    "Norway",
    "Finland",
    "Belgium",
    "Netherlands",
    "Luxembourg",
]

# Industries to monitor across all countries
INDUSTRIES = [
    "Financial Services",
    "Healthcare / Pharma",
    "Tech / SaaS",
    "E-commerce / Retail",
    "Manufacturing",
]

# Anthropic API config
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
MODEL = "claude-sonnet-4-20250514"

SYSTEM_PROMPT = (
    "You are a macro economic research analyst. Search the web for the most "
    "recent and significant economic, policy, and industry developments from "
    "the past 7 days. Be specific with data points, figures, and named entities. "
    "Always include source URLs. Respond ONLY in valid JSON with no markdown formatting."
)

# Email config
GMAIL_ADDRESS = os.getenv("GMAIL_ADDRESS")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")
EMAIL_RECIPIENTS = [
    os.getenv("EMAIL_TO_GMAIL"),
    os.getenv("EMAIL_TO_OUTLOOK"),
]
