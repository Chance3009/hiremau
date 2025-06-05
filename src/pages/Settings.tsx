import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ATSConfig from '@/components/settings/ATSConfig';
import ATSSync from '@/components/settings/ATSSync';

const Settings = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your application settings and integrations
                </p>
            </div>

            <Tabs defaultValue="ats" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="ats">ATS Integration</TabsTrigger>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="ats" className="space-y-6">
                    <ATSConfig />
                    <ATSSync />
                </TabsContent>

                <TabsContent value="general">
                    <div className="text-sm text-muted-foreground">
                        General settings coming soon...
                    </div>
                </TabsContent>

                <TabsContent value="notifications">
                    <div className="text-sm text-muted-foreground">
                        Notification settings coming soon...
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Settings; 