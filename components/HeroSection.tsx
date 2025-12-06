"use client"

import { useState } from "react"
import { Check } from "lucide-react"

type StepType = "hero" | "question" | "result"

interface QuestionData {
  id: number
  question: string
  type: "single-select" | "multi-select" | "slider"
  options?: string[]
  minLabel?: string
  maxLabel?: string
}

const QUESTIONS: QuestionData[] = [
  {
    id: 1,
    question: "¿Qué tipo de entorno prefieres?",
    type: "single-select",
    options: [
      "Tranquilo y residencial 🌳",
      "Dinámico y urbano 🏙️",
      "Mixto: cerca de todo pero sin tanto ruido 🏢🌿",
    ],
  },
  {
    id: 2,
    question: "¿Qué tamaño de propiedad buscas?",
    type: "single-select",
    options: ["1 habitación", "2 habitaciones", "3 o más habitaciones"],
  },
  {
    id: 3,
    question: "¿Qué amenidades valoras más?",
    type: "multi-select",
    options: [
      "Gimnasio 💪",
      "Áreas verdes 🌿",
      "Piscina 🏊",
      "Seguridad 24/7 🔒",
      "Coworking 💻",
      "Pet-friendly 🐶",
      "Kids zone 👶",
    ],
  },
  {
    id: 4,
    question: "¿Cuál es tu rango de presupuesto aproximado?",
    type: "single-select",
    options: [
      "Q500,000 – Q800,000",
      "Q800,000 – Q1,200,000",
      "Más de Q1,200,000",
    ],
  },
  {
    id: 5,
    question: "¿Qué tan importante es para ti la seguridad de la zona?",
    type: "single-select",
    options: [
      "Muy importante 🔒",
      "Moderadamente importante 😐",
      "No es mi prioridad 🚶",
    ],
  },
  {
    id: 6,
    question:
      "¿Qué tan importante es vivir cerca de tu trabajo, colegios o zonas comerciales?",
    type: "slider",
    minLabel: "No me importa tanto",
    maxLabel: "Muy importante",
  },
]

function ProgressBar({
  currentStep,
  totalSteps,
}: {
  currentStep: number
  totalSteps: number
}) {
  return (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, idx) => {
        const stepNum = idx + 1
        const isCompleted = stepNum < currentStep
        const isActive = stepNum === currentStep
        return (
          <div key={idx} className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full transition-colors duration-300 flex items-center justify-center ${
                isCompleted || isActive ? "bg-[#00F0D0]" : "bg-gray-200"
              }`}
            >
              {isCompleted && <Check size={8} className="text-[#0B1B32]" />}
            </div>
            {idx < totalSteps - 1 && (
              <div
                className={`w-8 h-1 transition-colors duration-300 ${
                  stepNum < currentStep ? "bg-[#00F0D0]" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function HeroSection() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<
    Record<number, string | string[]>
  >({})
  const [sliderValue, setSliderValue] = useState(50)

  const handleStart = () => setCurrentStep(1)
  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, 7))
  const handlePrev = () => setCurrentStep((prev) => Math.max(prev - 1, 0))

  const toggleOption = (stepId: number, option: string, isMulti: boolean) => {
    setSelectedOptions((prev) => {
      const current = prev[stepId]
      if (isMulti) {
        const arrayCurrent = Array.isArray(current) ? current : []
        if (arrayCurrent.includes(option)) {
          return {
            ...prev,
            [stepId]: arrayCurrent.filter((item) => item !== option),
          }
        } else {
          return { ...prev, [stepId]: [...arrayCurrent, option] }
        }
      } else {
        return { ...prev, [stepId]: option }
      }
    })
  }

  const isSelected = (stepId: number, option: string) => {
    const current = selectedOptions[stepId]
    if (Array.isArray(current)) return current.includes(option)
    return current === option
  }

  const renderHero = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <h1 className="text-4xl md:text-[56px] leading-[1.1] font-bold text-[#0B1B32] tracking-tight">
        Queremos ayudarte a encontrar
        <br className="hidden md:block" />
        la zona perfecta para ti.
      </h1>
      <p className="text-lg md:text-xl font-medium text-[#0B1B32] mt-4">
        Solo te tomará 2 minutos.
      </p>
      <div className="pt-4">
        <button
          onClick={handleStart}
          className="bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] font-bold text-lg py-3.5 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-sm active:scale-95"
        >
          Comenzar
        </button>
      </div>
    </div>
  )

  const renderQuestion = () => {
    const questionData = QUESTIONS[currentStep - 1]
    if (!questionData) return null

    return (
      <div className="w-full max-w-2xl mx-auto animate-slide-in">
        <ProgressBar currentStep={currentStep} totalSteps={QUESTIONS.length} />

        <h2 className="text-3xl md:text-4xl font-bold text-[#0B1B32] mb-8 leading-tight">
          {questionData.question}
        </h2>

        <div className="mb-10 space-y-3">
          {questionData.type === "single-select" ||
          questionData.type === "multi-select" ? (
            questionData.options?.map((option, idx) => (
              <button
                key={idx}
                onClick={() =>
                  toggleOption(
                    questionData.id,
                    option,
                    questionData.type === "multi-select"
                  )
                }
                className={`w-full py-4 px-6 rounded-lg border-2 text-lg font-medium transition-all duration-200 flex items-center justify-between group
                  ${
                    isSelected(questionData.id, option)
                      ? "border-[#0B1B32] bg-[#0B1B32] text-white shadow-md"
                      : "border-[#0B1B32] text-[#0B1B32] bg-white hover:bg-gray-50"
                  }`}
              >
                <span>{option}</span>
                {isSelected(questionData.id, option) && (
                  <Check size={20} className="text-[#00F0D0]" />
                )}
              </button>
            ))
          ) : questionData.type === "slider" ? (
            <div className="py-10 px-4">
              <style>{`
                input[type=range] {
                  -webkit-appearance: none;
                  width: 100%;
                  background: transparent;
                }
                input[type=range]::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  height: 28px;
                  width: 28px;
                  border-radius: 50%;
                  background: #00F0D0;
                  border: 3px solid white;
                  cursor: pointer;
                  margin-top: -10px;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                  transition: transform 0.1s;
                }
                input[type=range]::-webkit-slider-thumb:hover {
                  transform: scale(1.1);
                }
                input[type=range]::-webkit-slider-runnable-track {
                  width: 100%;
                  height: 8px;
                  cursor: pointer;
                  border-radius: 4px;
                }
                input[type=range]::-moz-range-thumb {
                  height: 28px;
                  width: 28px;
                  border-radius: 50%;
                  background: #00F0D0;
                  border: 3px solid white;
                  cursor: pointer;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                }
                input[type=range]::-moz-range-track {
                  width: 100%;
                  height: 8px;
                  cursor: pointer;
                  background: #E5E7EB;
                  border-radius: 4px;
                }
              `}</style>

              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                className="w-full focus:outline-none"
                style={{
                  background: `linear-gradient(to right, #00F0D0 0%, #00F0D0 ${sliderValue}%, #E5E7EB ${sliderValue}%, #E5E7EB 100%)`,
                  height: "8px",
                  borderRadius: "4px",
                }}
              />
              <div className="flex justify-between mt-6 text-[#0B1B32] font-medium text-sm md:text-base">
                <span className="opacity-80">{questionData.minLabel}</span>
                <span className="opacity-80">{questionData.maxLabel}</span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-center gap-6">
          <button
            onClick={handlePrev}
            className="bg-[#4AB7E6] hover:bg-[#39a0cc] text-white font-bold text-lg py-3 px-8 rounded-full transition-all duration-200 min-w-[140px]"
          >
            Anterior
          </button>
          <button
            onClick={handleNext}
            className="bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] font-bold text-lg py-3 px-8 rounded-full transition-all duration-200 min-w-[160px] whitespace-nowrap"
          >
            {currentStep === QUESTIONS.length ? "Ver resultados!" : "Siguiente"}
          </button>
        </div>
      </div>
    )
  }

  const renderResults = () => (
    <div className="w-full max-w-[1200px] mx-auto animate-fade-in pb-10">
      <div className="text-center mb-10">
        <div className="inline-block px-6 py-2 rounded-full border border-[#0B1B32] text-[#0B1B32] font-bold mb-6">
          Resultados test
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-[#0B1B32] mb-4">
          Tu zona ideal está aquí
        </h2>
        <p className="text-lg text-[#0B1B32] font-medium max-w-2xl mx-auto">
          Basado en tus respuestas, encontramos proyectos que encajan con tu
          estilo de vida y presupuesto.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12 px-4">
        <div className="bg-[#0B1B32] text-white p-8 rounded-[2rem] relative">
          <h3 className="text-2xl font-bold mb-4">Zona recomendada:</h3>
          <p className="text-lg leading-relaxed opacity-90">
            Zona 15: segura, residencial y con buena accesibilidad. Ideal si
            buscas tranquilidad sin alejarte del centro.
          </p>
          <div className="absolute -bottom-4 left-10 w-8 h-8 bg-[#0B1B32] transform rotate-45 hidden md:block" />
        </div>

        <div className="bg-[#0B1B32] text-white p-8 rounded-[2rem] relative">
          <h3 className="text-2xl font-bold mb-4">Conclusión 2</h3>
          <p className="text-lg leading-relaxed opacity-90">
            Zona 15: segura, residencial y con buena accesibilidad. Ideal si
            buscas tranquilidad sin alejarte del centro.
          </p>
          <div className="absolute -bottom-4 left-10 w-8 h-8 bg-[#0B1B32] transform rotate-45 hidden md:block" />
        </div>

        <div className="bg-[#0B1B32] text-white p-8 rounded-[2rem] relative">
          <h3 className="text-2xl font-bold mb-4">Conclusión 3</h3>
          <p className="text-lg leading-relaxed opacity-90">
            Zona 15: segura, residencial y con buena accesibilidad. Ideal si
            buscas tranquilidad sin alejarte del centro.
          </p>
          <div className="absolute -bottom-4 left-10 w-8 h-8 bg-[#0B1B32] transform rotate-45 hidden md:block" />
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => window.location.reload()}
          className="bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] font-bold text-lg py-4 px-12 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          Ver proyectos en esta zona
        </button>
      </div>
    </div>
  )

  return (
    <main className="flex-grow flex flex-col items-center justify-center text-center px-4 md:px-6 py-8 min-h-[80vh]">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
      {currentStep === 0 && renderHero()}
      {currentStep > 0 && currentStep <= 6 && renderQuestion()}
      {currentStep === 7 && renderResults()}
    </main>
  )
}
