import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import {
  Shield,
  Users,
  BookOpen,
  CheckCircle,
  Lock,
  ArrowRight,
  Clock,
  Award,
  AlertTriangle,
  Sparkles,
  Play
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { MANDATORY_TUTORIALS, getMandatoryTutorials, getTotalDuration } from '@/content/tutorials';
import { InteractiveTutorialViewer } from './InteractiveTutorialViewer';

interface TrainingProgress {
  tutorialId: string;
  isCompleted: boolean;
  completedAt?: string;
  certificationId?: string;
}

interface CreatorOnboardingProps {
  onComplete?: () => void;
  showAsModal?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function CreatorOnboarding({
  onComplete,
  showAsModal = false,
  isOpen = true,
  onClose
}: CreatorOnboardingProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [selectedTutorial, setSelectedTutorial] = useState<string | null>(null);
  const [showCompletionCelebration, setShowCompletionCelebration] = useState(false);

  const mandatoryTutorials = getMandatoryTutorials('creator');
  const totalDuration = getTotalDuration(mandatoryTutorials);

  // Fetch training progress
  const { data: progressData, isLoading } = useQuery<{
    progress: TrainingProgress[];
    allComplete: boolean;
    certifications: Array<{
      id: string;
      name: string;
      earnedAt: string;
      expiresAt?: string;
    }>;
  }>({
    queryKey: ['/api/creator/training-progress'],
    staleTime: 0,
  });

  const completedCount = progressData?.progress?.filter(p => p.isCompleted).length || 0;
  const overallProgress = (completedCount / mandatoryTutorials.length) * 100;

  // Check if specific tutorial is completed
  const isTutorialCompleted = (tutorialId: string) => {
    return progressData?.progress?.find(p => p.tutorialId === tutorialId)?.isCompleted || false;
  };

  // Check if tutorial is available (prerequisites met)
  const isTutorialAvailable = (tutorialId: string) => {
    const tutorial = mandatoryTutorials.find(t => t.id === tutorialId);
    if (!tutorial?.prerequisites) return true;
    return tutorial.prerequisites.every(prereqId => isTutorialCompleted(prereqId));
  };

  // Handle tutorial completion
  const handleTutorialComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/creator/training-progress'] });
    setSelectedTutorial(null);

    // Check if all tutorials are now complete
    const newCompletedCount = completedCount + 1;
    if (newCompletedCount === mandatoryTutorials.length) {
      setShowCompletionCelebration(true);
    }
  };

  // Handle all training complete
  const handleAllTrainingComplete = () => {
    setShowCompletionCelebration(false);
    onComplete?.();
  };

  // If viewing a tutorial, show the viewer
  if (selectedTutorial) {
    const tutorial = mandatoryTutorials.find(t => t.id === selectedTutorial);
    if (tutorial) {
      return (
        <InteractiveTutorialViewer
          tutorial={tutorial}
          onComplete={handleTutorialComplete}
          onExit={() => setSelectedTutorial(null)}
        />
      );
    }
  }

  const content = (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-red-900/20",
      showAsModal && "min-h-0"
    )}>
      {/* Header */}
      <div className={cn(
        "relative overflow-hidden",
        showAsModal ? "py-6" : "py-12"
      )}>
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-amber-500/20 backdrop-blur-3xl"></div>
        <div className="relative max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-red-600 to-amber-500 p-3 rounded-full">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">
              Creator Training Center
            </h1>

            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Complete these mandatory training modules before you can start creating content.
              This ensures you understand legal requirements and platform best practices.
            </p>

            {/* Overall Progress */}
            <Card className="bg-gray-800/50 border-gray-700 max-w-md mx-auto">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                  <span className="font-medium text-white">Training Progress</span>
                  <span>{completedCount} of {mandatoryTutorials.length} complete</span>
                </div>
                <Progress value={overallProgress} className="h-3" />
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    ~{totalDuration} minutes total
                  </div>
                  {progressData?.allComplete && (
                    <Badge className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      All Complete
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mandatory Notice */}
      {!progressData?.allComplete && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Alert className="bg-amber-900/30 border-amber-500/50">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <AlertTitle className="text-amber-400">Required Training</AlertTitle>
            <AlertDescription className="text-gray-300">
              You must complete all training modules before you can upload content or go live.
              This is required by law and platform policy.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Training Modules */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {mandatoryTutorials.map((tutorial, index) => {
            const isCompleted = isTutorialCompleted(tutorial.id);
            const isAvailable = isTutorialAvailable(tutorial.id);

            return (
              <Card
                key={tutorial.id}
                className={cn(
                  "border transition-all",
                  isCompleted
                    ? "bg-green-900/20 border-green-500/30"
                    : isAvailable
                    ? "bg-gray-800/50 border-gray-700 hover:border-primary/50"
                    : "bg-gray-800/30 border-gray-800 opacity-60"
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Step Number / Status */}
                    <div
                      className={cn(
                        "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
                        isCompleted
                          ? "bg-green-600 text-white"
                          : isAvailable
                          ? "bg-primary/20 text-primary"
                          : "bg-gray-700 text-gray-500"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : isAvailable ? (
                        index + 1
                      ) : (
                        <Lock className="h-5 w-5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className={cn(
                            "text-lg font-semibold mb-1",
                            isCompleted ? "text-green-400" : "text-white"
                          )}>
                            {tutorial.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {tutorial.difficulty}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {tutorial.duration} min
                            </span>
                            <span className="text-xs text-gray-400">
                              <BookOpen className="h-3 w-3 inline mr-1" />
                              {tutorial.steps.length} steps
                            </span>
                          </div>
                        </div>

                        {tutorial.certification && isCompleted && (
                          <Badge className="bg-amber-600 flex-shrink-0">
                            <Award className="h-3 w-3 mr-1" />
                            Certified
                          </Badge>
                        )}
                      </div>

                      <p className="text-gray-400 text-sm mb-4">
                        {tutorial.description}
                      </p>

                      {/* Learning Objectives Preview */}
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 mb-2">What you'll learn:</p>
                        <div className="flex flex-wrap gap-2">
                          {tutorial.learningObjectives.slice(0, 3).map((objective, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs bg-gray-700/50"
                            >
                              {objective}
                            </Badge>
                          ))}
                          {tutorial.learningObjectives.length > 3 && (
                            <Badge variant="secondary" className="text-xs bg-gray-700/50">
                              +{tutorial.learningObjectives.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center gap-3">
                        {isCompleted ? (
                          <>
                            <Button
                              variant="outline"
                              className="border-green-500/50 text-green-400"
                              onClick={() => setSelectedTutorial(tutorial.id)}
                            >
                              <BookOpen className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                            <span className="text-xs text-green-400 flex items-center">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Completed
                            </span>
                          </>
                        ) : isAvailable ? (
                          <Button
                            onClick={() => setSelectedTutorial(tutorial.id)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Training
                          </Button>
                        ) : (
                          <div className="flex items-center text-gray-500 text-sm">
                            <Lock className="h-4 w-4 mr-2" />
                            Complete previous training to unlock
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Completion Actions */}
        {progressData?.allComplete && (
          <div className="mt-8 text-center">
            <Card className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/30">
              <CardContent className="p-8">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-green-600 rounded-full">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Training Complete!
                </h3>
                <p className="text-gray-300 mb-6">
                  You've completed all mandatory training. You're now ready to start creating content!
                </p>

                {/* Earned Certifications */}
                {progressData.certifications && progressData.certifications.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-400 mb-3">Your Certifications:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {progressData.certifications.map((cert) => (
                        <Badge
                          key={cert.id}
                          className="bg-amber-600 text-white px-3 py-1"
                        >
                          <Award className="h-4 w-4 mr-1" />
                          {cert.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  size="lg"
                  onClick={onComplete}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Continue to Dashboard
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Completion Celebration Dialog */}
      <Dialog open={showCompletionCelebration} onOpenChange={setShowCompletionCelebration}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="p-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full">
                  <Award className="h-12 w-12 text-white" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl text-white">
              All Training Complete!
            </DialogTitle>
            <DialogDescription className="text-center text-gray-300">
              Congratulations! You've completed all mandatory creator training.
              You're now certified and ready to start creating content on BoyFanz!
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex justify-center gap-2">
              {mandatoryTutorials.map((tutorial) => (
                tutorial.certification && (
                  <Badge
                    key={tutorial.id}
                    className="bg-amber-600 text-white px-3 py-1"
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    {tutorial.certification.name}
                  </Badge>
                )
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleAllTrainingComplete}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Start Creating Content
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  if (showAsModal) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return content;
}

export default CreatorOnboarding;
