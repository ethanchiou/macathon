"""
Lesson Plan Generator Service
Uses Google Gemini API to generate structured biology lesson plans
"""
import json
import os
from typing import Optional

import google.generativeai as genai

from ..models.lesson import LessonPlan, GenerateRequest


# Evolution knowledge pack for demo quality
EVOLUTION_KNOWLEDGE_PACK = {
    "key_concepts": [
        "natural selection",
        "variation",
        "heritability",
        "selection pressure",
        "adaptation",
        "fitness",
        "descent with modification",
        "common ancestry"
    ],
    "common_misconceptions": [
        {
            "misconception": "Individuals evolve during their lifetime",
            "correction": "Populations evolve over generations, not individuals. An individual organism cannot evolve; it can only adapt through physiological changes.",
            "checkQuestion": "Can a single bird evolve a longer beak during its lifetime? Why or why not?"
        },
        {
            "misconception": "Evolution has a goal or direction",
            "correction": "Evolution has no purpose or goal. It's the result of random mutations and natural selection based on current environmental conditions.",
            "checkQuestion": "Did giraffes evolve long necks because they 'needed' to reach high leaves?"
        },
        {
            "misconception": "Only the strongest survive (survival of the fittest means strongest)",
            "correction": "'Fittest' means best suited to the environment, not physically strongest. A small, camouflaged animal may be more 'fit' than a large, visible one.",
            "checkQuestion": "In a forest environment, would a brightly colored or a camouflaged insect be more 'fit'?"
        }
    ]
}


SYSTEM_PROMPT = """You are a biology curriculum developer. Generate lesson plans in JSON format.
Requirements: grade-appropriate content, low-cost materials, include misconceptions.
Return ONLY valid JSON, no markdown."""


def get_generation_prompt(request: GenerateRequest) -> str:
    """Build the generation prompt with schema and requirements."""
    
    topic_lower = request.topicPrompt.lower()
    knowledge_context = ""
    
    # Add evolution knowledge pack if relevant
    if "evolution" in topic_lower or "natural selection" in topic_lower:
        knowledge_context = f"""
Use this knowledge pack for accuracy:
Key Concepts: {', '.join(EVOLUTION_KNOWLEDGE_PACK['key_concepts'])}
Required Misconceptions to Address: {json.dumps(EVOLUTION_KNOWLEDGE_PACK['common_misconceptions'], indent=2)}
"""
    
    return f"""Create a biology lesson plan with these parameters:

Region/Country: {request.region}
Grade Band: {request.gradeBand}
Duration: {request.durationMinutes} minutes
Topic: {request.topicPrompt}
{knowledge_context}

Required JSON Schema:
{{
  "title": "string - engaging lesson title",
  "gradeBand": "{request.gradeBand}",
  "region": "{request.region}",
  "durationMinutes": {request.durationMinutes},
  "learningGoals": ["goal 1", "goal 2", "goal 3"],
  "priorKnowledgeRecap": {{
    "bullets": ["review point 1", "review point 2", "review point 3"],
    "quickCheckQuestions": ["question 1", "question 2"]
  }},
  "coreExplanation": ["paragraph 1", "paragraph 2", "paragraph 3", "paragraph 4", "paragraph 5"],
  "commonMisconceptions": [
    {{
      "misconception": "what students often think",
      "correction": "the correct understanding",
      "checkQuestion": "question to verify understanding"
    }}
  ],
  "activity": {{
    "title": "activity name",
    "timeMinutes": 10,
    "materials": ["low-cost item 1", "low-cost item 2"],
    "steps": ["step 1", "step 2", "step 3"],
    "teacherPrompts": ["prompt 1", "prompt 2"],
    "expectedStudentResponses": ["response 1", "response 2"]
  }},
  "exitTicket": ["question 1", "question 2", "question 3", "question 4"],
  "differentiation": {{
    "strugglingLearners": ["strategy 1", "strategy 2"],
    "advancedLearners": ["extension 1", "extension 2"],
    "languageLearners": ["support 1", "support 2"]
  }},
  "localContextExamples": ["local example 1", "local example 2", "local example 3"]
}}

Generate the lesson plan now. Return ONLY valid JSON."""


def get_fallback_lesson_plan(request: GenerateRequest) -> LessonPlan:
    """Return a safe fallback lesson plan if generation fails."""
    
    activity_time = 10 if request.durationMinutes == 20 else 25
    
    return LessonPlan(
        title=f"Introduction to {request.topicPrompt}",
        gradeBand=request.gradeBand,
        region=request.region,
        durationMinutes=request.durationMinutes,
        learningGoals=[
            f"Students will understand the basic concepts of {request.topicPrompt}",
            "Students will be able to explain key terms in their own words",
            "Students will apply concepts to real-world examples"
        ],
        priorKnowledgeRecap={
            "bullets": [
                "Living things share common characteristics",
                "All organisms are made of cells",
                "Organisms interact with their environment"
            ],
            "quickCheckQuestions": [
                "What are the basic characteristics of living things?",
                "Why do organisms need to interact with their environment?"
            ]
        },
        coreExplanation=[
            f"Today we will explore {request.topicPrompt}. This topic is important because it helps us understand how living things work and interact.",
            "Scientists have studied this topic for many years and have discovered important patterns and processes.",
            "Understanding these concepts will help you see biology in the world around you.",
            f"In {request.region}, we can observe many examples of these biological processes in nature.",
            "By the end of this lesson, you'll be able to explain these concepts to others."
        ],
        commonMisconceptions=[
            {
                "misconception": "Biology only happens in laboratories",
                "correction": "Biology is the study of all living things, and it happens everywhere around us - in our homes, schools, and nature.",
                "checkQuestion": "Where can you observe biology in your daily life?"
            },
            {
                "misconception": "All scientific discoveries are made by a few genius scientists",
                "correction": "Scientific discoveries are made by many people working together, including students like you who ask good questions.",
                "checkQuestion": "How can asking questions help us learn about biology?"
            }
        ],
        activity={
            "title": "Observation Challenge",
            "timeMinutes": activity_time,
            "materials": [
                "Paper and pencils",
                "Objects from around the classroom"
            ],
            "steps": [
                "Form groups of 2-3 students",
                "Each group selects an object to observe",
                "Draw and describe the object in detail",
                "Share observations with the class"
            ],
            "teacherPrompts": [
                "What details do you notice that others might miss?",
                "How does this relate to what we learned today?"
            ],
            "expectedStudentResponses": [
                "Students identify specific details and features",
                "Students connect observations to the lesson concepts"
            ]
        },
        exitTicket=[
            f"What is one new thing you learned about {request.topicPrompt}?",
            "How can you apply this knowledge outside of class?",
            "What question do you still have?",
            "Rate your understanding from 1-5"
        ],
        differentiation={
            "strugglingLearners": [
                "Provide vocabulary cards with definitions and pictures",
                "Allow students to work with a partner for support"
            ],
            "advancedLearners": [
                "Challenge students to research additional examples",
                "Ask students to create a teaching resource for others"
            ],
            "languageLearners": [
                "Provide key terms in multiple languages when possible",
                "Use visual aids and diagrams to support understanding"
            ]
        },
        localContextExamples=[
            f"In {request.region}, we can observe these concepts in local plants and animals",
            f"Farmers in {request.region} use knowledge of biology in their work",
            f"Local ecosystems in {request.region} demonstrate these biological principles"
        ]
    )


class LessonGenerator:
    """Service for generating lesson plans using Google Gemini API."""
    
    def __init__(self):
        api_key = os.getenv("GEMINI_KEY")
        if not api_key:
            self.model = None
        else:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel(
                model_name="gemini-2.0-flash-lite",
                system_instruction=SYSTEM_PROMPT
            )
    
    async def generate(self, request: GenerateRequest) -> LessonPlan:
        """Generate a lesson plan from the request."""
        
        if not self.model:
            # No API key - return fallback
            return get_fallback_lesson_plan(request)
        
        try:
            prompt = get_generation_prompt(request)
            
            # Use generation config for JSON output
            generation_config = {
                "temperature": 0.7,
                "top_p": 0.9,
                "max_output_tokens": 2000,
                "response_mime_type": "application/json",
            }
            
            response = await self.model.generate_content_async(
                prompt,
                generation_config=generation_config
            )
            
            content = response.text
            lesson_data = json.loads(content)
            
            # Validate against schema
            lesson_plan = LessonPlan(**lesson_data)
            return lesson_plan
            
        except Exception as e:
            print(f"Generation error: {e}")
            # Return fallback on any error
            return get_fallback_lesson_plan(request)


# Singleton instance
_generator: Optional[LessonGenerator] = None


def get_lesson_generator() -> LessonGenerator:
    """Get singleton lesson generator instance."""
    global _generator
    if _generator is None:
        _generator = LessonGenerator()
    return _generator
