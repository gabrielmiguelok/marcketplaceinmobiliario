"use client"

import { useState } from "react"
import { Check } from "lucide-react"

interface QuestionData {
  id: number
  question: string
  type: "single-select" | "multi-select" | "slider"
  options?: string[]
  minLabel?: string
  maxLabel?: string
}

const ZONE_QUESTIONS: QuestionData[] = [
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
  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <div
      className="flex items-center justify-center space-x-2 mb-8"
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Progreso del quiz: paso ${currentStep} de ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }).map((_, idx) => {
        const stepNum = idx + 1
        const isActive = stepNum <= currentStep
        return (
          <div key={idx} className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                isActive ? "bg-[#00F0D0]" : "bg-gray-200"
              }`}
              aria-hidden="true"
            />
            {idx < totalSteps - 1 && (
              <div
                className={`w-8 h-1 transition-colors duration-300 ${
                  stepNum < currentStep ? "bg-[#00F0D0]" : "bg-gray-200"
                }`}
                aria-hidden="true"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

interface ZoneQuizSectionProps {
  onBack: () => void
}

export default function ZoneQuizSection({ onBack }: ZoneQuizSectionProps) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
  const [sliderValue, setSliderValue] = useState(50)

  const handleNext = () => {
    if (step === 0) {
      setStep(1)
    } else {
      setStep((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (step === 0) {
      onBack()
    } else if (step === 1) {
      setStep(0)
    } else {
      setStep((prev) => prev - 1)
    }
  }

  const toggleOption = (stepId: number, option: string, isMulti: boolean) => {
    setAnswers((prev) => {
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
    const current = answers[stepId]
    if (Array.isArray(current)) return current.includes(option)
    return current === option
  }

  const renderIntro = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-12" role="region" aria-label="Introducción al quiz de zonas">
      <h1 className="text-4xl md:text-[56px] leading-[1.1] font-bold text-[#0B1B32] tracking-tight">
        Queremos ayudarte a encontrar
        <br className="hidden md:block" />
        la zona perfecta para ti.
      </h1>
      <p className="text-lg md:text-xl font-medium text-[#0B1B32] mt-4 opacity-80">
        Solo te tomará 2 minutos.
      </p>
      <div className="pt-8">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] font-bold text-lg py-4 px-16 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md"
          aria-label="Iniciar quiz de zonas"
        >
          Iniciar!
        </button>
      </div>
    </div>
  )

  const renderQuestion = () => {
    const questionData = ZONE_QUESTIONS[step - 1]
    if (!questionData) return renderResults()

    const isMultiSelect = questionData.type === "multi-select"

    return (
      <div className="w-full max-w-2xl mx-auto animate-slide-in" role="form" aria-label={`Pregunta ${step} de ${ZONE_QUESTIONS.length}`}>
        <ProgressBar currentStep={step} totalSteps={ZONE_QUESTIONS.length} />

        <fieldset className="mb-10">
          <legend className="text-3xl md:text-4xl font-bold text-[#0B1B32] mb-8 leading-tight">
            {questionData.question}
          </legend>

          <div className="space-y-3" role={isMultiSelect ? "group" : "radiogroup"} aria-label={questionData.question}>
            {questionData.type === "single-select" ||
            questionData.type === "multi-select" ? (
              questionData.options?.map((option, idx) => {
                const selected = isSelected(questionData.id, option)
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      toggleOption(
                        questionData.id,
                        option,
                        questionData.type === "multi-select"
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        toggleOption(
                          questionData.id,
                          option,
                          questionData.type === "multi-select"
                        )
                      }
                    }}
                    role={isMultiSelect ? "checkbox" : "radio"}
                    aria-checked={selected}
                    aria-label={option}
                    tabIndex={0}
                    className={`w-full py-4 px-6 rounded-lg border-2 text-lg font-medium transition-all duration-200 flex items-center justify-between group text-left
                      ${
                        selected
                          ? "border-[#0B1B32] bg-[#0B1B32] text-white shadow-md"
                          : "border-[#0B1B32] text-[#0B1B32] bg-white hover:bg-gray-50"
                      }`}
                  >
                    <span>{option}</span>
                    {selected && (
                      <Check size={20} className="text-[#00F0D0]" aria-hidden="true" />
                    )}
                  </button>
                )
              })
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
                  aria-label={`${questionData.question} - Valor actual: ${sliderValue}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={sliderValue}
                />
                <div className="flex justify-between mt-6 text-[#0B1B32] font-medium text-sm md:text-base">
                  <span className="opacity-80" id="slider-min-label">{questionData.minLabel}</span>
                  <span className="opacity-80" id="slider-max-label">{questionData.maxLabel}</span>
                </div>
              </div>
            ) : null}
          </div>
        </fieldset>

        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={handlePrev}
            className="bg-[#4AB7E6] hover:bg-[#39a0cc] text-white font-bold text-lg py-3 px-8 rounded-full transition-all duration-200 min-w-[140px]"
            aria-label={step === 1 ? "Volver al inicio" : "Volver a la pregunta anterior"}
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] font-bold text-lg py-3 px-8 rounded-full transition-all duration-200 min-w-[160px] whitespace-nowrap"
            aria-label={step === ZONE_QUESTIONS.length ? "Ver resultados del quiz" : "Ir a la siguiente pregunta"}
          >
            {step === ZONE_QUESTIONS.length ? "Ver resultados!" : "Siguiente"}
          </button>
        </div>
      </div>
    )
  }

  const renderResults = () => (
    <div
      className="w-full max-w-[1200px] mx-auto animate-fade-in pb-10"
      role="region"
      aria-label="Resultados del quiz de zonas"
      aria-live="polite"
    >
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

      <div className="grid md:grid-cols-3 gap-6 mb-12 px-4" role="list" aria-label="Zonas recomendadas">
        <article className="bg-[#0B1B32] text-white p-8 rounded-[2rem] relative" role="listitem">
          <h3 className="text-2xl font-bold mb-4">Zona recomendada:</h3>
          <p className="text-lg leading-relaxed opacity-90">
            Zona 15: segura, residencial y con buena accesibilidad. Ideal si
            buscas tranquilidad sin alejarte del centro.
          </p>
          <div className="absolute -bottom-4 left-10 w-8 h-8 bg-[#0B1B32] transform rotate-45 hidden md:block" aria-hidden="true" />
        </article>

        <article className="bg-[#0B1B32] text-white p-8 rounded-[2rem] relative" role="listitem">
          <h3 className="text-2xl font-bold mb-4">Opción B</h3>
          <p className="text-lg leading-relaxed opacity-90">
            Zona 10: Si prefieres estar cerca de centros financieros y vida
            nocturna, esta es una excelente alternativa.
          </p>
          <div className="absolute -bottom-4 left-10 w-8 h-8 bg-[#0B1B32] transform rotate-45 hidden md:block" aria-hidden="true" />
        </article>

        <article className="bg-[#0B1B32] text-white p-8 rounded-[2rem] relative" role="listitem">
          <h3 className="text-2xl font-bold mb-4">Opción C</h3>
          <p className="text-lg leading-relaxed opacity-90">
            Carretera a El Salvador: Más espacio por tu dinero, ideal si el
            tráfico no es tu principal preocupación.
          </p>
          <div className="absolute -bottom-4 left-10 w-8 h-8 bg-[#0B1B32] transform rotate-45 hidden md:block" aria-hidden="true" />
        </article>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] font-bold text-lg py-4 px-12 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          aria-label="Ver proyectos disponibles en las zonas recomendadas"
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

      {step === 0 && renderIntro()}
      {step > 0 && step <= ZONE_QUESTIONS.length && renderQuestion()}
      {step > ZONE_QUESTIONS.length && renderResults()}
    </main>
  )
}
