# ADR-0015: Angular NgRx State Management

Status: Accepted
Date: 2024-08-17
Tags: frontend, angular, state-management, ngrx
Authors: Sarah Johnson
Related: ADR-0010

## Context

Our Angular application has grown significantly, and we're experiencing challenges with state management:

- Components are sharing state through services, leading to inconsistent data
- Complex UI workflows require coordinating multiple async operations
- Debugging state changes is difficult
- Testing components with complex state dependencies is challenging
- We need better performance for real-time data updates

## Decision

We will implement NgRx as our state management solution with the following structure:

1. **Store Architecture**:
   - Feature-based store modules aligned with Angular lazy-loaded modules
   - Normalized state shape for entities following the entity adapter pattern
   - Separate state slices for UI state, domain data, and API status

2. **Key NgRx Patterns**:
   - Actions will follow the "[Source] Event" naming convention
   - Effects for all API interactions and complex workflows
   - Selectors with memoization for derived state
   - Meta-reducers for cross-cutting concerns like logging and hydration

3. **Performance Considerations**:
   - OnPush change detection strategy for all components
   - Entity cache with TTL for frequently accessed data
   - Selective hydration of state on application startup

## Consequences

### Positive

- Predictable state updates through unidirectional data flow
- Improved debugging with Redux DevTools
- Easier testing with pure reducer functions
- Better separation of concerns (components vs. state management)
- Consistent patterns for state management across the application

### Negative

- Increased boilerplate code
- Learning curve for developers new to NgRx/Redux
- Potential performance impact for very small components
- More complex setup for simple features

## Implementation Guidelines

- Use @ngrx/component-store for local state in complex components
- Implement custom serialization for large state objects
- Create facade services to abstract NgRx from presentational components
- Add NgRx DevTools in development environment
- Document standard patterns in team wiki

## References

- [NgRx Documentation](https://ngrx.io/docs)
- [NgRx Entity Pattern](https://ngrx.io/guide/entity)
- [Redux Style Guide](https://redux.js.org/style-guide/style-guide)
- Internal Frontend Architecture Document
