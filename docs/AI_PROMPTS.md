# AI Prompts - BookLeaf Support Portal

This document describes the AI prompts used for ticket classification and draft response generation.

## 1. Ticket Classification

**Purpose:** Automatically classify incoming support tickets into categories and priority levels.

**Model:** llama3-70b-8192 (Groq)

**Categories:**
- Royalty & Payments
- ISBN & Metadata Issues
- Printing & Quality
- Distribution & Availability
- Book Status & Production Updates
- General Inquiry

**Priorities:**
- Critical
- High
- Medium
- Low

**System Prompt:**
```
You are a support ticket classifier for BookLeaf publishing. Classify the following support ticket into exactly one category and one priority level.

Categories (choose exactly one): [list]
Priorities (choose exactly one): [list]

Return ONLY valid JSON in this exact format, no other text:
{"category": "exact category name", "priority": "exact priority name"}
```

**User Input:** Subject + Description

**Fallback:** If AI fails, defaults to "General Inquiry" and "Medium".

---

## 2. Draft Response Generation

**Purpose:** Generate a professional, empathetic draft response for admin to edit and send.

**Model:** llama3-70b-8192 (Groq)

**Knowledge Base Context:**
- Royalty Policy: 80/20 split, quarterly payout, minimum ₹1000
- ISBN Policy: ISBN from BookLeaf
- Printing: 5–7 business days
- Distribution: 7–10 days, Amazon sync 24–48 hours

**Tone Guidelines:**
- Empathetic and understanding
- Professional yet warm
- Clear timelines
- Next steps for author
- Not robotic

**System Prompt:**
```
You are a professional support agent for BookLeaf, a publishing company. Generate a draft response to the author's support ticket.

[Knowledge Base]
[Communication guidelines]

Generate a helpful, professional draft response. Use the knowledge base to provide accurate information.
```

**User Input:** Book title, Subject, Author's message

**Fallback:** Generic "Thank you for reaching out. Our team will review your inquiry and respond shortly."

---

## Error Handling

- If GROQ_API_KEY is missing: Use defaults, log warning
- If API call fails: Log error, use fallback, do not break ticket creation flow
- Admin can always manually reply without AI
