import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import useATSStore from '@/store/useATSStore';
import ATSIntegrationService from '@/services/atsIntegration';

const ATSSync = () => {
    const { config, isConnected, lastSync, syncInProgress, error, setSyncStatus, updateLastSync, setError } = useATSStore();

    const handleSync = async () => {
        if (!config || !isConnected) return;

        setSyncStatus(true);
        setError(null);

        try {
            const atsService = new ATSIntegrationService(config);

            // Sync candidates
            const candidateSync = await atsService.syncCandidates();
            console.log('Candidate sync results:', candidateSync);

            // Sync job postings
            const jobSync = await atsService.syncJobPostings();
            console.log('Job posting sync results:', jobSync);

            // Update last sync timestamp
            updateLastSync(new Date().toISOString());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sync with ATS');
        } finally {
            setSyncStatus(false);
        }
    };

    if (!isConnected) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>ATS Synchronization</CardTitle>
                    <CardDescription>
                        Connect to an ATS provider to enable synchronization
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <AlertDescription>
                            Please configure and connect to an ATS provider first.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>ATS Synchronization</CardTitle>
                <CardDescription>
                    Sync candidates and job postings with your ATS
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-sm font-medium">Last Synchronization</h3>
                            <p className="text-sm text-muted-foreground">
                                {lastSync ? (
                                    <>
                                        <Clock className="inline-block h-4 w-4 mr-1" />
                                        {format(new Date(lastSync), 'PPpp')}
                                    </>
                                ) : (
                                    'Never synced'
                                )}
                            </p>
                        </div>

                        <Button
                            onClick={handleSync}
                            disabled={syncInProgress}
                        >
                            {syncInProgress ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Syncing...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Sync Now
                                </>
                            )}
                        </Button>
                    </div>

                    {syncInProgress && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Sync in Progress</h4>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Synchronizing candidates...
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Synchronizing job postings...
                                </div>
                            </div>
                        </div>
                    )}

                    {lastSync && !syncInProgress && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Last Sync Summary</h4>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                    <CheckCircle2 className="h-4 w-4" />
                                    All data synchronized successfully
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default ATSSync; 