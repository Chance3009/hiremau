import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import useATSStore from '@/store/useATSStore';
import ATSIntegrationService from '@/services/atsIntegration';

const ATSConfig = () => {
    const { config, isConnected, syncInProgress, error, setConfig, clearConfig, setError } = useATSStore();

    const [provider, setProvider] = useState(config?.provider || 'workday');
    const [apiKey, setApiKey] = useState(config?.apiKey || '');
    const [apiEndpoint, setApiEndpoint] = useState(config?.apiEndpoint || '');
    const [organizationId, setOrganizationId] = useState(config?.organizationId || '');
    const [testingConnection, setTestingConnection] = useState(false);

    const handleTestConnection = async () => {
        setTestingConnection(true);
        setError(null);

        try {
            const atsService = new ATSIntegrationService({
                provider,
                apiKey,
                apiEndpoint,
                organizationId,
            });

            // Test connection by trying to fetch candidates
            await atsService.importCandidates();

            // If successful, save the configuration
            setConfig({
                provider,
                apiKey,
                apiEndpoint,
                organizationId,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to connect to ATS');
        } finally {
            setTestingConnection(false);
        }
    };

    const handleDisconnect = () => {
        clearConfig();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>ATS Integration</CardTitle>
                <CardDescription>
                    Configure your Applicant Tracking System integration
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>ATS Provider</Label>
                        <Select
                            value={provider}
                            onValueChange={setProvider}
                            disabled={isConnected}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select ATS provider" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="workday">Workday</SelectItem>
                                <SelectItem value="greenhouse">Greenhouse</SelectItem>
                                <SelectItem value="lever">Lever</SelectItem>
                                <SelectItem value="smartrecruiters">SmartRecruiters</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>API Key</Label>
                        <Input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            disabled={isConnected}
                            placeholder="Enter your ATS API key"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>API Endpoint</Label>
                        <Input
                            value={apiEndpoint}
                            onChange={(e) => setApiEndpoint(e.target.value)}
                            disabled={isConnected}
                            placeholder="https://api.your-ats.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Organization ID</Label>
                        <Input
                            value={organizationId}
                            onChange={(e) => setOrganizationId(e.target.value)}
                            disabled={isConnected}
                            placeholder="Enter your organization ID"
                        />
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        {!isConnected ? (
                            <Button
                                onClick={handleTestConnection}
                                disabled={testingConnection || !apiKey || !apiEndpoint || !organizationId}
                            >
                                {testingConnection && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {testingConnection ? 'Testing Connection' : 'Connect'}
                            </Button>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Connected to {provider}
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={handleDisconnect}
                                    disabled={syncInProgress}
                                >
                                    Disconnect
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {isConnected && (
                    <div className="pt-6 border-t">
                        <h3 className="text-sm font-medium mb-2">Integration Status</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Provider</span>
                                <span className="font-medium">{provider}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Organization ID</span>
                                <span className="font-medium">{organizationId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Sync Status</span>
                                <span className="font-medium">
                                    {syncInProgress ? (
                                        <span className="text-amber-600">Syncing...</span>
                                    ) : (
                                        <span className="text-green-600">Ready</span>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ATSConfig; 