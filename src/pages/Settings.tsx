import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ATSConfig from '@/components/settings/ATSConfig';
import ATSSync from '@/components/settings/ATSSync';
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const Settings = () => {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Settings"
                subtitle="Configure application preferences"
            />

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

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>Configure your general preferences</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Settings content */}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Settings; 