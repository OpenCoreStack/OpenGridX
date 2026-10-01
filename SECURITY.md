# Security Policy

## Supported versions

Security fixes are released for the latest minor version only. Upgrade to the newest 3.x release to receive them; upgrading from 2.x is covered in the [migration guide](docs/migration/v2-to-v3.md).

| Version | Supported |
| ------- | --------- |
| 3.2.x   | :white_check_mark: |
| < 3.2   | :x: |

## Reporting a vulnerability

Please **do not** open a public issue, pull request or discussion for a security problem.

Report it privately through GitHub: [Security → Report a vulnerability](https://github.com/OpenCoreStack/OpenGridX/security/advisories/new). If you can't use GitHub, email **asif.ansari7774@gmail.com** with "OpenGridX security" in the subject.

Include:

- the affected version(s)
- a description of the issue and its impact (for example, script injection through a cell value or an export)
- steps or a minimal reproduction

What to expect:

- **Acknowledgement** within 7 days.
- **Assessment** within 14 days: whether the report is accepted, and its severity.
- **Fix:** accepted issues are fixed in a patch release, and a GitHub security advisory is published with credit to the reporter unless you ask otherwise. We ask that you keep the details private until the fix is released.
- **Declined reports** get an explanation of why.

OpenGridX has no runtime dependencies. Vulnerabilities in the optional peers (`exceljs`, `jspdf`, `jspdf-autotable`) should be reported to those projects; tell us too if OpenGridX's use of them makes the problem exploitable.
