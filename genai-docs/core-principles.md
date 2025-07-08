# Core engineering principles

Centralized repository of core engineering principles for the project.

## Product & user principles

- **Relentlessly User-Centric**
  Prioritize understanding and addressing user needs. Product quality, developer productivity, and job satisfaction are all downstream effects of this focus. Success is determined by the value delivered to users.
- **Stable Priorities**
  Maintain stable, clear organizational priorities. Constant churn is a primary cause of burnout and must be actively managed and mitigated by leadership.

## Delivery principles

- **Maintain Small Batch Sizes**
  This is the most critical delivery principle. Large changes are the primary cause of reduced delivery stability and throughput. All work is broken down into the smallest possible units that can be independently deployed and deliver value.
- **Trunk-Based Development**
  All work integrates into the `main` branch continuously. Avoid long-lived feature branches to prevent integration complexity and support small batch sizes.
- **Comprehensive Automation**
  The path to production must be fully automated. This includes all testing, quality gates, and infrastructure provisioning. Manual steps are an anti-pattern.
- **Promote Decoupled Deployment & Release**
  Champion the use of feature flags to separate the act of deploying code to production from the act of releasing features to users. This reduces risk and enables progressive rollouts.

## Architectural principles

- **Stateless Services**
  Services must not maintain internal state. State externalizes to dedicated persistence layers.
- **Idempotent Operations**
  Design all API endpoints and event handlers to be retried without unintended side effects.
- **Design for Failure**
  Assume every component and dependency will fail. Implement mechanisms for graceful degradation, retries (with backoff), and circuit breakers.
- **Embedded Observability**
  Systems design for observability from the start, including structured logging, key metrics, and distributed tracing.
- **Adhere to DRY (Knowledge, Not Code)**
  Every piece of knowledge must have a single, unambiguous representation.
- **Employ Asynchronous Communication**
  Use message queues or event streams for non-blocking operations to enhance scalability and resilience.
- **Demand Loose Coupling**
  Components must interact through stable, well-defined interfaces (APIs, events). This allows components to develop, deploy, and scale independently.

## Code & implementation principles

- **Prefer Plain Objects and ES Modules**
  Favor plain JavaScript objects with TypeScript types over class syntax. This improves interoperability, reduces boilerplate, and enhances predictability. Use ES module boundaries (`export`/`import`) for encapsulation, not class visibility keywords. Unexported code is private.
- **Avoid `any`; Use `unknown`**
  The `any` type disables type safety and is forbidden. For values of an unknown type, use `unknown` and perform explicit type-narrowing checks.
- **Embrace Array Operators**
  Use functional array operators (`.map`, `.filter`, `.reduce`) to promote immutability and improve code readability.

## Testing & validation principles

- **Single Preflight Command**
  All validation—building, testing, type-checking, and linting—must be executable via a single command (for example, `npm run preflight`). This ensures consistent quality checks for all changes.
