## Readiness check (0 = missing, 1 = partial, 2 = done)

### 1. Tokens as data

- 2: tokens in a standard format (e.g. DTCG JSON), each with a description
- 1: tokens exist in code but without descriptions or a standard format
- 0: values live only in design files

### 2. Component APIs

- 2: typed props with documented purpose and limits
- 1: typed props, little documentation
- 0: no stable API

### 3. Agent access

- 2: an agent can query components, tokens and docs (a server, an index or files in the repo)
- 1: an agent can read files if pointed to them
- 0: everything lives behind a website or design tool

### 4. Readable docs

- 2: plain markdown, an llms.txt and a DESIGN.md
- 1: markdown docs, no index
- 0: docs only as a website

### 5. Guidance for consuming teams

- 2: an AGENTS.md written for teams building with the system
- 1: guidance written only for contributors
- 0: none

Score: __ / 10
Top three fixes:
