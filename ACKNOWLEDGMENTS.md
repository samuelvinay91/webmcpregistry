# Acknowledgments

The WebMCP Registry SDK is an independent, community-driven implementation of the [WebMCP specification](https://webmachinelearning.github.io/webmcp/). We are deeply grateful to the individuals and organizations whose foundational work makes this project possible.

## W3C WebMCP Specification

The WebMCP standard is a [Draft Community Group Report](https://webmachinelearning.github.io/webmcp/) published by the **W3C Web Machine Learning Community Group**. It is **not a W3C Standard** — it represents ongoing work by a dedicated community of engineers.

### Spec Editors

- **Brandon Walderman** — Microsoft ([brwalder@microsoft.com](mailto:brwalder@microsoft.com))
- **Khushal Sagar** — Google ([khushalsagar@google.com](mailto:khushalsagar@google.com))
- **Dominic Farolino** — Google

### Original Explainer Authors

The [WebMCP explainer](https://github.com/webmachinelearning/webmcp/blob/main/README.md), first published August 13, 2025, was authored by:

**Microsoft:** Brandon Walderman, Leo Lee, Andrew Nolan
**Google:** David Bokan, Khushal Sagar, Hannah Van Opstal

The spec also acknowledges **Sushanth Rajasankar** for initial explainer, proposals, and discussions.

### W3C Community Group

- **Web Machine Learning Community Group** — https://www.w3.org/community/webmachinelearning/
- Chaired by **Anssi Kostiainen** (Intel)
- Published under the W3C Community Contributor License Agreement

## Model Context Protocol (MCP)

WebMCP builds on the [Model Context Protocol](https://modelcontextprotocol.io/) created by **Anthropic**. MCP provides the foundational concepts of tool registration, discovery, and invocation that WebMCP adapts for the browser.

### MCP Lead Maintainers

- **David Soria Parra** (@dsp-ant) — Lead Maintainer
- **Justin Spahr-Summers** (@jspahrsummers) — Lead Maintainer (founding)

### MCP Core Maintainers

Caitie McCaffrey, Che Liu, Den Delimarsky, Kurtis Van Gent, Nick Aldridge, Nick Cooper, Paul Carleton, Peter Alexander

- Specification: https://github.com/modelcontextprotocol/modelcontextprotocol
- TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk

## Google Chrome Implementation & Tooling

- **François Beaufort** — Built the [Model Context Tool Inspector](https://github.com/beaufortfrancois/model-context-tool-inspector) Chrome Extension
- **GoogleChromeLabs/webmcp-tools** — Official [demos, evals CLI, and developer tools](https://github.com/GoogleChromeLabs/webmcp-tools) (Apache 2.0)
- The Chrome team for shipping WebMCP as an early preview in Chrome 146 Canary

## Early Community Implementations

The spec acknowledges these individuals for sharing early implementation experience that informed the standard:

- **Alex Nahas** (@MiguelsPizza) — [MCP-B / WebMCP](https://github.com/MiguelsPizza/WebMCP) browser extension and transport layer
- **Jason McGhee** (@jasonjmcghee) — [WebMCP](https://github.com/jasonjmcghee/WebMCP) early implementation

## Active Spec Contributors

We recognize the many individuals contributing to the spec through issues and discussions, including: Douglas Parker, Idan Levin, Erdal Karaca, Adam Bradford, David Crowe, Hemanth HM, and the broader Web Machine Learning Community Group participants.

## Our Position

This SDK is an **independent implementation** — not affiliated with or endorsed by Google, Microsoft, Anthropic, or the W3C. We aim to be the most complete, production-ready developer toolkit for the WebMCP standard.

Where our SDK extends beyond the W3C spec, we clearly mark features as `[EXTENSION]`:
- **Safety levels** (`read | write | danger`) — the spec only defines `readOnlyHint`
- **`getTools()`** — the spec only defines `registerTool()` and `unregisterTool()`
- **Security scanning, validation, grading** — entirely our additions
- **Manifest generation** (`.well-known/webmcp.json`, JSON-LD, `llms.txt`) — our proposals

## License

This project is licensed under Apache 2.0 by **RAPHATECH OÜ**.

The WebMCP specification is published under the [W3C Software and Document License](https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document).

The MCP specification is published under MIT / Apache 2.0 / CC-BY 4.0.
