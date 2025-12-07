"use client"

import { useState } from "react"
import { Check } from "lucide-react"

type QuestionType = "single-select" | "numeric"

interface QuestionData {
  id: number
  question: string
  subtext?: string
  type: QuestionType
  options?: string[]
  placeholder?: string
}

const PREQUAL_QUESTIONS: QuestionData[] = [
  {
    id: 1,
    question: "¿En qué etapa estás de tu búsqueda de vivienda?",
    type: "single-select",
    options: [
      "Explorando opciones",
      "Buscando una propiedad para inversión",
      "Buscando una propiedad para vivir",
      "List@ para solicitar crédito",
    ],
  },
  {
    id: 2,
    question: "¿Cuál es el ingreso mensual total de tu hogar?",
    subtext:
      "Incluye todos los ingresos netos (después de impuestos) de quienes aportarán al crédito.",
    type: "numeric",
    placeholder: "Ingresa el monto",
  },
  {
    id: 3,
    question: "¿Tu ingreso es demostrable ante el banco?",
    subtext: "Esto puede influir en las condiciones del crédito.",
    type: "single-select",
    options: ["Sí", "No"],
  },
  {
    id: 4,
    question: "¿Cuánto destinas al pago de deudas o compromisos cada mes?",
    subtext: "Incluye préstamos, tarjetas u otros pagos fijos.",
    type: "numeric",
    placeholder: "Ingresa el monto",
  },
  {
    id: 5,
    question: "¿Cuánto tienes ahorrado para el enganche?",
    subtext:
      "Este monto se sumará a tu capacidad de crédito para estimar el rango de propiedad.",
    type: "numeric",
    placeholder: "Ingresa el monto",
  },
  {
    id: 6,
    question: "¿Qué edad tiene la persona principal que aplicaría al crédito?",
    subtext: "Esto permite ajustar el plazo máximo y el tono del resultado",
    type: "single-select",
    options: ["<30", "30 - 40", "41-50", "51+"],
  },
  {
    id: 7,
    question: "¿Es tu primera vez comprando una propiedad?",
    subtext: "Esto puede influir en las condiciones del crédito.",
    type: "single-select",
    options: ["Sí (Tip: Podrías calificar a beneficios especiales)", "No"],
  },
  {
    id: 8,
    question: "¿En cuántos años te gustaría pagar el crédito?",
    subtext: "A mayor plazo, cuotas más bajas (pero más intereses).",
    type: "single-select",
    options: ["15 años", "20 años", "25 años"],
  },
]

function ProgressBar({
  currentStep,
  totalSteps,
}: {
  currentStep: number
  totalSteps: number
}) {
  const percentage = (currentStep / totalSteps) * 100
  return (
    <div
      className="flex items-center justify-center space-x-2 mb-8"
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={0}
      aria-valuemax={totalSteps}
      aria-label={`Progreso del quiz de precalificación: paso ${currentStep} de ${totalSteps}`}
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

interface PrequalQuizSectionProps {
  onBack: () => void
}

export default function PrequalQuizSection({
  onBack,
}: PrequalQuizSectionProps) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [numericValue, setNumericValue] = useState("")

  const handleNext = () => {
    const currentQ = PREQUAL_QUESTIONS[step - 1]
    if (currentQ?.type === "numeric" && numericValue) {
      setAnswers((prev) => ({ ...prev, [currentQ.id]: numericValue }))
      setNumericValue("")
    }
    setStep((prev) => prev + 1)
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

  const toggleOption = (stepId: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [stepId]: option }))
  }

  const isSelected = (stepId: number, option: string) => {
    return answers[stepId] === option
  }

  const renderIntro = () => (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in py-12" role="region" aria-label="Introducción al quiz de precalificación">
      <h2 className="text-4xl md:text-5xl font-bold text-[#0B1B32]">
        Pre-calificación de aloba
      </h2>
      <p className="text-xl text-[#0B1B32] leading-relaxed max-w-2xl mx-auto opacity-80">
        Descubre tu rango de inversión y conoce si estás listo para dar el
        siguiente paso hacia tu nueva propiedad.
      </p>
      <div className="pt-8">
        <button
          onClick={() => setStep(1)}
          className="bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] font-bold text-lg py-4 px-16 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md"
          aria-label="Iniciar quiz de precalificación"
        >
          Iniciar!
        </button>
      </div>
    </div>
  )

  const renderQuestion = () => {
    const questionData = PREQUAL_QUESTIONS[step - 1]
    if (!questionData) return renderResults()

    return (
      <div className="w-full max-w-2xl mx-auto animate-slide-in" role="form" aria-label={`Pregunta ${step} de ${PREQUAL_QUESTIONS.length}`}>
        <ProgressBar currentStep={step} totalSteps={PREQUAL_QUESTIONS.length} />

        <fieldset className="border-0 p-0 m-0">
          <legend className="text-3xl md:text-4xl font-bold text-[#0B1B32] mb-4 leading-tight">
            {questionData.question}
          </legend>

          {questionData.subtext && (
            <p className="text-[#0B1B32] opacity-70 mb-8 text-lg font-medium">
              {questionData.subtext}
            </p>
          )}

          <div className="mb-10 space-y-3" role={questionData.type === "single-select" ? "radiogroup" : undefined} aria-label={questionData.type === "single-select" ? questionData.question : undefined}>
            {questionData.type === "single-select" &&
              questionData.options?.map((option, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleOption(questionData.id, option)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      toggleOption(questionData.id, option)
                    }
                  }}
                  role="radio"
                  aria-checked={isSelected(questionData.id, option)}
                  tabIndex={0}
                  className={`w-full py-4 px-6 rounded-lg border-2 text-lg font-medium transition-all duration-200 flex items-center justify-between group text-left
                    ${
                      isSelected(questionData.id, option)
                        ? "border-[#0B1B32] bg-[#0B1B32] text-white shadow-md"
                        : "border-[#0B1B32] text-[#0B1B32] bg-white hover:bg-gray-50"
                    }`}
                >
                  <span>{option}</span>
                  {isSelected(questionData.id, option) && (
                    <Check size={20} className="text-[#00F0D0]" aria-hidden="true" />
                  )}
                </button>
              ))}

            {questionData.type === "numeric" && (
              <div className="relative">
                <label htmlFor={`numeric-input-${questionData.id}`} className="sr-only">
                  {questionData.question}
                </label>
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0B1B32] font-bold text-lg" aria-hidden="true">
                  Q
                </span>
                <input
                  id={`numeric-input-${questionData.id}`}
                  type="number"
                  placeholder={questionData.placeholder}
                  value={numericValue}
                  onChange={(e) => setNumericValue(e.target.value)}
                  className="w-full py-4 pl-10 pr-6 rounded-lg border-2 border-[#0B1B32] text-lg font-medium text-[#0B1B32] focus:outline-none focus:ring-2 focus:ring-[#00F0D0] focus:border-transparent transition-all"
                  aria-label={questionData.question}
                  aria-describedby={questionData.subtext ? `subtext-${questionData.id}` : undefined}
                />
                {questionData.subtext && (
                  <span id={`subtext-${questionData.id}`} className="sr-only">
                    {questionData.subtext}
                  </span>
                )}
              </div>
            )}
          </div>
        </fieldset>

        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={handlePrev}
            className="bg-[#4AB7E6] hover:bg-[#39a0cc] text-white font-bold text-lg py-3 px-8 rounded-full transition-all duration-200 min-w-[140px]"
            aria-label={step === 1 ? "Volver a la introducción" : "Volver a la pregunta anterior"}
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] font-bold text-lg py-3 px-8 rounded-full transition-all duration-200 min-w-[160px] whitespace-nowrap"
            aria-label={step === PREQUAL_QUESTIONS.length ? "Ver resultados de la precalificación" : "Ir a la siguiente pregunta"}
          >
            {step === PREQUAL_QUESTIONS.length ? "Ver resultados!" : "Siguiente"}
          </button>
        </div>
      </div>
    )
  }

  const renderResults = () => (
    <div className="w-full max-w-[800px] mx-auto animate-fade-in pb-10" role="region" aria-label="Resultados de precalificación" aria-live="polite">
      <div className="text-center mb-10">
        <div className="inline-block px-6 py-2 rounded-full border border-[#0B1B32] text-[#0B1B32] font-bold mb-6">
          Resultado de Pre-calificación
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-[#0B1B32] mb-6">
          ¡Excelentes noticias!
        </h2>
        <p className="text-xl text-[#0B1B32] font-medium mb-8">
          Basado en tus ingresos y ahorros, tienes un perfil financiero sólido.
        </p>

        <div className="bg-[#0B1B32] text-white p-10 rounded-[2.5rem] shadow-xl mb-10" role="article" aria-label="Estimación de capacidad de compra">
          <div className="text-sm uppercase tracking-wider opacity-70 mb-2">
            Capacidad de Compra Estimada
          </div>
          <div className="text-5xl font-bold text-[#00F0D0] mb-4" aria-label="Capacidad estimada de un millón doscientos cincuenta mil quetzales">
            Q1,250,000
          </div>
          <p className="opacity-90 leading-relaxed">
            Podrías aplicar a un crédito con cuotas mensuales aproximadas de{" "}
            <span className="font-bold text-[#00F0D0]">Q8,500</span> a un plazo
            de 25 años.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] font-bold py-4 px-10 rounded-full transition-all"
            aria-label="Ver propiedades en este rango de precios"
          >
            Ver propiedades en este rango
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="border-2 border-[#0B1B32] hover:bg-gray-50 text-[#0B1B32] font-bold py-4 px-10 rounded-full transition-all"
            aria-label="Contactar a un asesor inmobiliario"
          >
            Contactar a un asesor
          </button>
        </div>
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
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}</style>

      {step === 0 && renderIntro()}
      {step > 0 && step <= PREQUAL_QUESTIONS.length && renderQuestion()}
      {step > PREQUAL_QUESTIONS.length && renderResults()}
    </main>
  )
}
