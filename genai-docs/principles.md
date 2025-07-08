# Core Engineering Principles

Our principles are derived from DORA research and are non-negotiable foundations of our engineering culture.

## Product & User Principles

- **Relentlessly User-Centric**: We prioritize understanding and addressing user needs. Product quality, developer productivity, and job satisfaction are all downstream effects of this focus. We measure our success by the value we deliver to users.
- **Stable Priorities**: We work to maintain stable, clear organizational priorities. Constant churn is a primary cause of burnout and must be actively managed and mitigated by leadership.

## Delivery Principles

- **Maintain Small Batch Sizes**: This is our most critical delivery principle. Large changes are the primary cause of reduced delivery stability and throughput. All work must be broken down into the smallest possible units that can be independently deployed and deliver value.
- **Trunk-Based Development**: All work is integrated into the `main` branch continuously. Long-lived feature branches are avoided to prevent integration complexity and support small batch sizes.

## Architectural Principles

- **Stateless Services**: Services must not maintain internal state. State is externalized to dedicated persistence layers.
- **Idempotent Operations**: All API endpoints and event handlers must be designed to be safely retried without unintended side effects.
- **Design for Failure**: We assume every component and dependency will fail. Systems must include mechanisms for graceful degradation.
- **Embedded Observability**: Systems must be designed for observability from the start, including structured logging, key metrics, and distributed tracing.
- **Adhere to DRY (Don't Repeat Yourself)**: Every piece of knowledge must have a single, unambiguous representation.

## Code & Implementation Principles

- **Prefer Plain Objects and ES Modules**: We favor plain JavaScript objects with TypeScript types over class syntax. This improves interoperability, reduces boilerplate, and enhances predictability. We use ES module boundaries (`export`/`import`) for encapsulation, not class visibility keywords. Unexported code is private.
- **Avoid `any`; Use `unknown`**: The `any` type disables type safety and is forbidden. For values of an unknown type, use `unknown` and perform explicit type-narrowing checks.
- **Embrace Array Operators**: Use functional array operators (`.map`, `.filter`, `.reduce`) to promote immutability and improve code readability.

## Testing & Validation Principles

- **Comprehensive Automation**: The path to production must be fully automated. This includes all testing, quality gates, and infrastructure provisioning. Manual steps are an anti-pattern.
- **Single Preflight Command**: All validation—building, testing, type-checking, and linting—must be executable via a single command (for example, `npm run preflight`). This ensures consistent quality checks for all changes.
- **Pragmatic Mocking**: Only mock dependencies when tests are expensive (for example, slow I/O, network calls, complex setup). For cheap tests (for example, simple functions, local file system interactions), prefer real implementations to ensure higher fidelity and simpler test code.
