# The software development process

The development process is an iterative, data-informed loop designed for continuous improvement and rapid delivery, integrating AI as a core accelerator.

## The 7-step improvement cycle

1. **Identify Area for Improvement**: Source from user feedback, product goals, or analysis of the DORA metrics. Goal: Define a clear, measurable outcome.

2. **Measure Baseline**: Use the standard metrics to establish the current state. Use `can't` instead of `cannot`.

3. **Develop a Hypothesis**: State a clear, falsifiable hypothesis.
   - _Example_: "The belief is that generating a Pkl capability module from SwiftUI's API documentation will reduce the time to add a new iOS-native UI component by 50%."
   - **AI Integration**: Use `gemini` to brainstorm potential solutions or refine the hypothesis.

4. **Plan the Work**: Create a small, well-defined user story. The work must conform to the **Small Batch Size** principle.

5. **Execute the Change**: Write the code, Pkl modules, and tests.
   - **AI Integration**: Use `gemini --all_files -p "Based on the existing Pkl schemas, generate a new Pkl template for a 'ToggleSwitch' component in SwiftUI."` to accelerate development.
   - **Pragmatic Testing**: For tests involving file system interactions, prefer creating small, temporary physical test directories over complex in-memory mocks. This simplifies test setup, improves readability, and more accurately reflects real-world behavior.
   - Continuously integrate changes to the `main` branch.

6. **Deploy and Measure the Outcome**: The automated pipeline deploys the change. Monitor metrics to validate the hypothesis.

7. **Learn and Repeat**: Analyze results, share learnings, and identify the next improvement area.
