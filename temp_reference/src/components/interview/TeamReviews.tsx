import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Star, Users } from 'lucide-react';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatar?: string;
}

interface Review {
    id: string;
    reviewerId: string;
    reviewerName: string;
    reviewerRole: string;
    rating: number;
    comment: string;
    timestamp: string;
}

interface TeamReviewsProps {
    teamMembers: TeamMember[];
    reviews: Review[];
    onAddReview: (review: Omit<Review, 'id' | 'timestamp'>) => void;
    currentUser: TeamMember;
}

const TeamReviews: React.FC<TeamReviewsProps> = ({
    teamMembers,
    reviews,
    onAddReview,
    currentUser
}) => {
    const [newReview, setNewReview] = useState({
        rating: 3,
        comment: ''
    });

    const handleSubmitReview = () => {
        onAddReview({
            reviewerId: currentUser.id,
            reviewerName: currentUser.name,
            reviewerRole: currentUser.role,
            rating: newReview.rating,
            comment: newReview.comment
        });
        setNewReview({ rating: 3, comment: '' });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Team Reviews</CardTitle>
                        <CardDescription>Feedback from team members</CardDescription>
                    </div>
                    <Users className="h-5 w-5 text-primary" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Team Members */}
                    <div>
                        <h3 className="font-medium mb-3">Review Team</h3>
                        <div className="flex gap-2">
                            {teamMembers.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex flex-col items-center gap-1"
                                    title={`${member.name} - ${member.role}`}
                                >
                                    <Avatar>
                                        <AvatarImage src={member.avatar} />
                                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground">{member.name.split(' ')[0]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Existing Reviews */}
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-secondary/20 p-4 rounded-lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <Avatar>
                                        <AvatarImage src={teamMembers.find(m => m.id === review.reviewerId)?.avatar} />
                                        <AvatarFallback>{review.reviewerName[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{review.reviewerName}</div>
                                        <div className="text-sm text-muted-foreground">{review.reviewerRole}</div>
                                    </div>
                                    <div className="ml-auto flex items-center gap-1">
                                        {Array.from({ length: review.rating }).map((_, i) => (
                                            <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm">{review.comment}</p>
                                <div className="mt-2 text-xs text-muted-foreground">
                                    {new Date(review.timestamp).toLocaleDateString()} at{' '}
                                    {new Date(review.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add New Review */}
                    <div className="space-y-4">
                        <Separator />
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium">Add Your Review</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={currentUser.avatar} />
                                    <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                                </Avatar>
                                <span>{currentUser.name}</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Label>Rating</Label>
                                <RadioGroup
                                    value={String(newReview.rating)}
                                    onValueChange={(value) => setNewReview({ ...newReview, rating: Number(value) })}
                                    className="flex gap-4 mt-2"
                                >
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <div key={value} className="flex items-center gap-2">
                                            <RadioGroupItem value={String(value)} id={`rating-${value}`} />
                                            <Label htmlFor={`rating-${value}`} className="flex gap-1">
                                                {value} <Star className="h-4 w-4" />
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                            <div>
                                <Label>Comments</Label>
                                <Textarea
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                    placeholder="Share your thoughts about the candidate..."
                                    className="mt-2"
                                />
                            </div>
                            <Button onClick={handleSubmitReview} className="w-full">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Submit Review
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default TeamReviews; 