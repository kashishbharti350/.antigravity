export const questions = {
    hr: [
        {
            id: 'hr_1',
            text: "Tell me about yourself and your background.",
            idealAnswer: "Briefly cover your education, relevant experience, current role, and what you are looking for in your next position. Keep it professional and focused on your career journey. Avoid going deeply into personal hobbies unless highly relevant."
        },
        {
            id: 'hr_2',
            text: "Why do you want to work for our company?",
            idealAnswer: "Show you have researched the company. Mention specific products, culture, or recent news, and connect them to your own career goals and values. Explicitly tie your skills to what they are building."
        },
        {
            id: 'hr_3',
            text: "Describe a challenge you faced and how you overcame it.",
            idealAnswer: "Use the STAR method (Situation, Task, Action, Result). Focus heavily on the specific Action you took to resolve the challenge, and ensure the Result highlights a positive or learning outcome."
        }
    ],
    technical: [
        {
            id: 'tech_1',
            text: "Explain the difference between let, const, and var in JavaScript.",
            idealAnswer: "Var is function-scoped and hoisted. Let and const are block-scoped and not accessible before declaration. Let can be reassigned, while const cannot be reassigned after its initial declaration, though object properties can still be mutated."
        },
        {
            id: 'tech_2',
            text: "What is a closure in JavaScript? Provide an example use case.",
            idealAnswer: "A closure is a function that remembers its outer lexical environment even after the outer function has returned. It is widely used for data privacy (emulating private methods) and maintaining state in asynchronous callbacks."
        },
        {
            id: 'tech_3',
            text: "How does React's Virtual DOM improve performance?",
            idealAnswer: "React creates an in-memory representation of the UI. Upon state changes, it diffs the new Virtual DOM with the old one, calculates the minimal set of real DOM updates required, and batches them, effectively avoiding expensive repaints."
        }
    ]
};
