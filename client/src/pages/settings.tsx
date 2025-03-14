import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { AppSettings } from "@shared/schema";

// Settings form schema
const settingsFormSchema = z.object({
  allowRegistration: z.boolean().default(true),
  maintenanceMode: z.boolean().default(false),
  appVersion: z.string().min(1, "App version is required"),
  notificationMessage: z.string().optional(),
  vipFeatures: z.array(z.string()).optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [featureInput, setFeatureInput] = useState("");

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/settings");
      const data = await response.json();
      return data as AppSettings;
    },
  });

  // Update settings mutation
  const { mutate: updateSettings, isPending } = useMutation({
    mutationFn: async (data: SettingsFormValues) => {
      const response = await apiRequest("PUT", "/api/settings", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings updated",
        description: "Your application settings have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update settings: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      allowRegistration: true,
      maintenanceMode: false,
      appVersion: "",
      notificationMessage: "",
      vipFeatures: [],
    },
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      form.reset({
        allowRegistration: settings.allowRegistration,
        maintenanceMode: settings.maintenanceMode,
        appVersion: settings.appVersion,
        notificationMessage: settings.notificationMessage,
        vipFeatures: settings.vipFeatures,
      });
    }
  }, [settings, form]);

  // Handle form submission
  const onSubmit = (values: SettingsFormValues) => {
    updateSettings(values);
  };

  // Add VIP feature
  const addFeature = () => {
    if (!featureInput.trim()) return;
    
    const currentFeatures = form.getValues("vipFeatures") || [];
    form.setValue("vipFeatures", [...currentFeatures, featureInput.trim()]);
    setFeatureInput("");
  };

  // Remove VIP feature
  const removeFeature = (index: number) => {
    const currentFeatures = form.getValues("vipFeatures") || [];
    form.setValue(
      "vipFeatures",
      currentFeatures.filter((_, i) => i !== index)
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Application Settings</h1>
        <p className="text-muted-foreground">
          Configure global settings for the admin panel and user application.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic application settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="allowRegistration"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Allow Registration</FormLabel>
                        <FormDescription>
                          Allow new users to register with the application
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maintenanceMode"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Maintenance Mode</FormLabel>
                        <FormDescription>
                          Enable maintenance mode to prevent user access
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <FormField
                control={form.control}
                name="appVersion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App Version</FormLabel>
                    <FormControl>
                      <Input placeholder="1.0.0" {...field} />
                    </FormControl>
                    <FormDescription>
                      Current application version number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notificationMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Global Notification</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a notification message to display to all users"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This message will be displayed to all users. Leave empty for no notification.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>VIP Features</CardTitle>
              <CardDescription>
                Configure the features available to VIP users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter a VIP feature"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" onClick={addFeature}>
                    Add
                  </Button>
                </div>

                <div className="space-y-2">
                  <FormLabel>Current VIP Features</FormLabel>
                  <ul className="border rounded-md divide-y">
                    {form.watch("vipFeatures")?.length ? (
                      form.watch("vipFeatures")?.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between p-3"
                        >
                          <span>{feature}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFeature(index)}
                          >
                            Remove
                          </Button>
                        </li>
                      ))
                    ) : (
                      <li className="p-3 text-muted-foreground">
                        No VIP features defined
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-6 py-4">
              <Button type="submit" disabled={isPending} className="ml-auto">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}