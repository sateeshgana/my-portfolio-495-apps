/** Default input fields per domain used in batch mode */
export const DOMAIN_INPUTS = {
  food: [
    { id: 'ingredients', label: 'Your ingredients', type: 'textarea', placeholder: 'e.g. eggs, flour, milk, butter' },
  ],
  travel: [
    { id: 'destination', label: 'Destination', type: 'text', placeholder: 'e.g. Tokyo, Japan' },
    { id: 'duration',    label: 'Trip duration', type: 'text', placeholder: 'e.g. 7 days' },
  ],
  health: [
    { id: 'topic', label: 'Health topic or symptoms', type: 'textarea', placeholder: 'Describe your question or situation' },
  ],
  creative: [
    { id: 'prompt', label: 'Your prompt or topic', type: 'textarea', placeholder: 'Describe what you want to create' },
  ],
  science: [
    { id: 'question', label: 'Your question or topic', type: 'textarea', placeholder: 'e.g. How does photosynthesis work?' },
  ],
  'real-estate': [
    { id: 'details', label: 'Property or situation details', type: 'textarea', placeholder: 'Describe the property or question' },
  ],
  legal: [
    { id: 'situation', label: 'Describe your situation', type: 'textarea', placeholder: 'What legal question do you have?' },
  ],
  business: [
    { id: 'details', label: 'Business details or question', type: 'textarea', placeholder: 'Describe your business or situation' },
  ],
  marketing: [
    { id: 'product',  label: 'Product or service', type: 'text', placeholder: 'What are you marketing?' },
    { id: 'audience', label: 'Target audience',    type: 'text', placeholder: 'Who is your customer?' },
  ],
  'dev-tools': [
    { id: 'input', label: 'Code or description', type: 'textarea', placeholder: 'Paste code or describe your problem' },
  ],
  civic: [
    { id: 'topic', label: 'Topic or situation', type: 'textarea', placeholder: 'Describe your civic question or need' },
  ],
  finance: [
    { id: 'question', label: 'Your financial question', type: 'textarea', placeholder: 'e.g. Should I invest in index funds?' },
  ],
  education: [
    { id: 'question', label: 'Subject or question', type: 'textarea', placeholder: 'What do you want to learn or understand?' },
  ],
  productivity: [
    { id: 'task', label: 'Task or goal description', type: 'textarea', placeholder: 'Describe the task or goal' },
  ],
  hr: [
    { id: 'situation', label: 'HR situation or question', type: 'textarea', placeholder: 'Describe the HR situation' },
  ],
}

/** Generate a systemPrompt from app name and tagline for batch mode */
export function deriveSystemPrompt(name, tagline) {
  return `You are ${name}, an AI tool that helps users with the following: ${tagline}. Be helpful, concise, and practical. Provide clear, actionable output based on the user's input.`
}
