# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 0.x     | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT open a public GitHub issue.**
2. Email us at: **security@raphatech.com**
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Affected package(s)
   - Potential impact

We will respond within 48 hours and work with you on a fix before any public disclosure.

## Security Considerations for WebMCP

The WebMCP browser standard introduces new attack surfaces for websites. Our SDK includes built-in security scanning (`@webmcpregistry/core` security module) that checks for:

- **Prompt injection** in tool descriptions
- **Deceptive tool naming** (impersonating system/admin tools)
- **Unrestricted string inputs** (potential data exfiltration)
- **Unclassified dangerous operations** (missing safety annotations)
- **Suspicious URLs** in descriptions
- **Encoded content** (base64 payloads in descriptions)

We recommend running `npx @webmcpregistry/cli test <your-url>` to scan your implementation.
