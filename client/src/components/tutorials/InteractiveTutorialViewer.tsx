import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Clock,
  Award,
  Target,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Shield,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Tutorial, TutorialStep } from '@/content/tutorials';
import ReactMarkdown from 'react-markdown';

interface TutorialProgress {
  tutorialId: string;
  currentStep: number;
  completedSteps: number[];
  quizAnswers: Record<string, number>;
  startedAt: string;
  completedAt?: string;
  isCompleted: boolean;
}

interface InteractiveTutorialViewerProps {
  tutorial: Tutorial;
  onComplete?: () => void;
  onExit?: () => void;
}

export function InteractiveTutorialViewer({
  tutorial,
  onComplete,
  onExit
}: InteractiveTutorialViewerProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const currentStep = tutorial.steps[currentStepIndex];
  const totalSteps = tutorial.steps.length;
  const progress = (completedSteps.length / totalSteps) * 100;

  // Fetch existing progress
  const { data: savedProgress } = useQuery<TutorialProgress>({
    queryKey: [`/api/tutorials/${tutorial.id}/progress`],
    staleTime: 0,
  });

  // Save progress mutation
  const saveProgressMutation = useMutation({
    mutationFn: async (data: Partial<TutorialProgress>) => {
      const res = await fetch(`/api/tutorials/${tutorial.id}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save progress');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tutorials/${tutorial.id}/progress`] });
    }
  });

  // Complete tutorial mutation
  const completeTutorialMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tutorials/${tutorial.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to complete tutorial');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tutorials'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/certifications'] });
    }
  });

  // Load saved progress on mount
  useEffect(() => {
    if (savedProgress) {
      setCurrentStepIndex(savedProgress.currentStep);
      setCompletedSteps(savedProgress.completedSteps || []);
    }
  }, [savedProgress]);

  // Mark current step as completed
  const markStepComplete = () => {
    if (!completedSteps.includes(currentStepIndex)) {
      const newCompletedSteps = [...completedSteps, currentStepIndex];
      setCompletedSteps(newCompletedSteps);

      saveProgressMutation.mutate({
        currentStep: currentStepIndex,
        completedSteps: newCompletedSteps,
        isCompleted: newCompletedSteps.length === totalSteps
      });
    }
  };

  // Navigate to next step
  const goToNextStep = () => {
    markStepComplete();

    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setQuizAnswer(null);
      setQuizSubmitted(false);
    } else {
      // Tutorial complete
      setShowCompletionDialog(true);
      completeTutorialMutation.mutate();
    }
  };

  // Navigate to previous step
  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setQuizAnswer(null);
      setQuizSubmitted(false);
    }
  };

  // Handle quiz submission
  const submitQuiz = () => {
    if (quizAnswer !== null) {
      setQuizSubmitted(true);
    }
  };

  // Handle interactive navigation
  const handleInteractiveAction = () => {
    if (currentStep.interactiveElement?.target) {
      if (currentStep.interactiveElement.type === 'navigation') {
        // Open in new tab or navigate
        window.open(currentStep.interactiveElement.target, '_blank');
      }
      markStepComplete();
    }
  };

  // Handle completion
  const handleComplete = () => {
    setShowCompletionDialog(false);
    onComplete?.();
  };

  // Handle exit
  const handleExit = () => {
    setShowExitDialog(false);
    onExit?.();
  };

  // Check if current step can proceed
  const canProceed = () => {
    if (currentStep.type === 'quiz') {
      return quizSubmitted && quizAnswer === currentStep.quiz?.correctAnswer;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExitDialog(true)}
                className="text-gray-400 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Exit
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-white">{tutorial.title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Badge variant="outline" className="text-xs">
                    {tutorial.category}
                  </Badge>
                  {tutorial.isMandatory && (
                    <Badge className="bg-red-600 text-white text-xs">Mandatory</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {tutorial.duration} min
              </div>
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-1" />
                {currentStepIndex + 1} / {totalSteps}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{Math.round(progress)}% Complete</span>
              <span>{completedSteps.length} of {totalSteps} steps</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Navigation */}
          <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-2">
            {tutorial.steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => {
                  if (index <= Math.max(...completedSteps, 0) + 1) {
                    setCurrentStepIndex(index);
                    setQuizAnswer(null);
                    setQuizSubmitted(false);
                  }
                }}
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  index === currentStepIndex
                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-gray-900"
                    : completedSteps.includes(index)
                    ? "bg-green-600 text-white"
                    : index <= Math.max(...completedSteps, 0) + 1
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-800 text-gray-600 cursor-not-allowed"
                )}
                disabled={index > Math.max(...completedSteps, 0) + 1}
              >
                {completedSteps.includes(index) ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-3">
              {currentStep.type === 'quiz' && <Target className="h-6 w-6 text-purple-400" />}
              {currentStep.type === 'interactive' && <Play className="h-6 w-6 text-green-400" />}
              {currentStep.type === 'video' && <Play className="h-6 w-6 text-blue-400" />}
              {currentStep.type === 'text' && <BookOpen className="h-6 w-6 text-yellow-400" />}
              <CardTitle className="text-xl text-white">{currentStep.title}</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Warning Note */}
            {currentStep.warningNote && (
              <Alert variant="destructive" className="bg-red-900/30 border-red-500/50">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important Warning</AlertTitle>
                <AlertDescription>{currentStep.warningNote}</AlertDescription>
              </Alert>
            )}

            {/* Main Content */}
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{currentStep.content}</ReactMarkdown>
            </div>

            {/* Tips */}
            {currentStep.tips && currentStep.tips.length > 0 && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-400 font-medium mb-3">
                  <Lightbulb className="h-5 w-5" />
                  Pro Tips
                </div>
                <ul className="space-y-2">
                  {currentStep.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <span className="text-blue-400">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Interactive Element */}
            {currentStep.type === 'interactive' && currentStep.interactiveElement && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 text-center">
                <Play className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-white mb-2">
                  Interactive Exercise
                </p>
                <p className="text-gray-300 mb-6">
                  {currentStep.interactiveElement.instruction}
                </p>
                <Button
                  onClick={handleInteractiveAction}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open {currentStep.interactiveElement.type === 'navigation' ? 'Page' : 'Exercise'}
                </Button>
              </div>
            )}

            {/* Quiz */}
            {currentStep.type === 'quiz' && currentStep.quiz && (
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
                <div className="flex items-center gap-2 text-purple-400 font-medium mb-4">
                  <Target className="h-5 w-5" />
                  Knowledge Check
                </div>

                <p className="text-lg text-white mb-6">{currentStep.quiz.question}</p>

                <RadioGroup
                  value={quizAnswer?.toString()}
                  onValueChange={(value) => setQuizAnswer(parseInt(value))}
                  disabled={quizSubmitted}
                  className="space-y-3"
                >
                  {currentStep.quiz.options.map((option, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center space-x-3 p-4 rounded-lg border transition-colors",
                        quizSubmitted && index === currentStep.quiz?.correctAnswer
                          ? "border-green-500 bg-green-900/20"
                          : quizSubmitted && quizAnswer === index && index !== currentStep.quiz?.correctAnswer
                          ? "border-red-500 bg-red-900/20"
                          : "border-gray-600 hover:border-gray-500"
                      )}
                    >
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label
                        htmlFor={`option-${index}`}
                        className="text-gray-200 cursor-pointer flex-1"
                      >
                        {option}
                      </Label>
                      {quizSubmitted && index === currentStep.quiz?.correctAnswer && (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      )}
                      {quizSubmitted && quizAnswer === index && index !== currentStep.quiz?.correctAnswer && (
                        <XCircle className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                  ))}
                </RadioGroup>

                {!quizSubmitted && (
                  <Button
                    onClick={submitQuiz}
                    disabled={quizAnswer === null}
                    className="mt-6 w-full"
                  >
                    Submit Answer
                  </Button>
                )}

                {quizSubmitted && (
                  <div
                    className={cn(
                      "mt-6 p-4 rounded-lg",
                      quizAnswer === currentStep.quiz.correctAnswer
                        ? "bg-green-900/30 border border-green-500/50"
                        : "bg-red-900/30 border border-red-500/50"
                    )}
                  >
                    {quizAnswer === currentStep.quiz.correctAnswer ? (
                      <div className="flex items-center gap-2 text-green-400 mb-2">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Correct!</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-400 mb-2">
                        <XCircle className="h-5 w-5" />
                        <span className="font-medium">Incorrect</span>
                      </div>
                    )}
                    <p className="text-gray-300">{currentStep.quiz.explanation}</p>

                    {quizAnswer !== currentStep.quiz.correctAnswer && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setQuizAnswer(null);
                          setQuizSubmitted(false);
                        }}
                        className="mt-4"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={goToPrevStep}
            disabled={currentStepIndex === 0}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <Button
            onClick={goToNextStep}
            disabled={!canProceed()}
            className={cn(
              currentStepIndex === totalSteps - 1
                ? "bg-green-600 hover:bg-green-700"
                : ""
            )}
          >
            {currentStepIndex === totalSteps - 1 ? (
              <>
                Complete Tutorial
                <Award className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                Next Step
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-green-600 rounded-full">
                <Award className="h-12 w-12 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl text-white">
              Congratulations!
            </DialogTitle>
            <DialogDescription className="text-center text-gray-300">
              You've completed "{tutorial.title}"
            </DialogDescription>
          </DialogHeader>

          {tutorial.certification && (
            <div className="bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border border-yellow-500/30 rounded-lg p-4 my-4">
              <div className="flex items-center justify-center gap-2 text-yellow-400 font-medium mb-2">
                <Shield className="h-5 w-5" />
                Certification Earned
              </div>
              <p className="text-center text-white font-semibold">
                {tutorial.certification.name}
              </p>
              {tutorial.certification.validFor > 0 && (
                <p className="text-center text-sm text-gray-400 mt-1">
                  Valid for {tutorial.certification.validFor} days
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={handleComplete} className="w-full">
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Exit Tutorial?</DialogTitle>
            <DialogDescription className="text-gray-300">
              Your progress will be saved. You can continue this tutorial anytime.
              {tutorial.isMandatory && (
                <span className="block mt-2 text-yellow-400">
                  Note: This is a mandatory tutorial. You'll need to complete it before creating content.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowExitDialog(false)}>
              Continue Learning
            </Button>
            <Button variant="destructive" onClick={handleExit}>
              Exit Tutorial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InteractiveTutorialViewer;
