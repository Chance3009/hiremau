
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Calendar, UserPlus, MessageSquare, CheckSquare } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  
  const navigationCards = [
    {
      title: "Dashboard",
      description: "View recruitment metrics and candidate statistics",
      icon: <LayoutDashboard className="h-6 w-6" />,
      path: "/dashboard",
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Event Setup",
      description: "Create and manage hiring events and job positions",
      icon: <Calendar className="h-6 w-6" />,
      path: "/event-setup",
      color: "bg-purple-50 text-purple-600"
    },
    {
      title: "Candidate Intake",
      description: "Register new candidates and upload resumes",
      icon: <UserPlus className="h-6 w-6" />,
      path: "/candidate-intake",
      color: "bg-green-50 text-green-600"
    },
    {
      title: "Interview Assistant",
      description: "Conduct interviews with AI-suggested questions",
      icon: <MessageSquare className="h-6 w-6" />,
      path: "/interview",
      color: "bg-amber-50 text-amber-600"
    },
    {
      title: "Final Review",
      description: "Make final decisions and export candidate data",
      icon: <CheckSquare className="h-6 w-6" />,
      path: "/final-review",
      color: "bg-rose-50 text-rose-600"
    }
  ];

  return (
    <div className="container mx-auto">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to HireFlow</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your AI-powered assistant for efficient candidate screening and interviewing at career fairs and hiring events.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {navigationCards.map((card, index) => (
            <Card key={index} className="overflow-hidden border hover:shadow-md transition-shadow duration-300">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${card.color}`}>
                    {card.icon}
                  </div>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <CardDescription>{card.description}</CardDescription>
              </CardContent>
              <CardFooter className="p-4 pt-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate(card.path)}
                >
                  Go to {card.title}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
