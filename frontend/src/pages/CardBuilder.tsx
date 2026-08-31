import CardCanvas from "@/components/cards/CardCanvas";
import { ContactTab, IdentityTab, StyleTab } from "@/components/cards/BuilderTabs";
import { ErrorState, LoadingState, SectionHeading } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCardBuilder } from "@/hooks/useCardBuilder";

export default function CardBuilder() {
  const {
    isNew,
    form,
    setField,
    payload,
    servicesText,
    setServicesText,
    socialsText,
    setSocialsText,
    cards,
    existing,
    save,
    navigate,
  } = useCardBuilder();

  if (!isNew && cards.isLoading) return <LoadingState testId="builder-loading" />;
  if (!isNew && cards.data && !existing) {
    return <ErrorState label="That card no longer exists." testId="builder-missing" />;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <SectionHeading
        eyebrow="Card builder"
        title={isNew ? "Create a new DigiCon card" : `Edit "${form.label}"`}
        testId="builder-heading"
      />
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass rounded-xl p-5">
          <Tabs defaultValue="identity">
            <TabsList variant="line" className="mb-4">
              <TabsTrigger value="identity" data-testid="builder-tab-identity">
                Identity
              </TabsTrigger>
              <TabsTrigger value="contact" data-testid="builder-tab-contact">
                Contact
              </TabsTrigger>
              <TabsTrigger value="style" data-testid="builder-tab-style">
                Style
              </TabsTrigger>
            </TabsList>

            <TabsContent value="identity">
              <IdentityTab
                form={form}
                setField={setField}
                servicesText={servicesText}
                setServicesText={setServicesText}
              />
            </TabsContent>
            <TabsContent value="contact">
              <ContactTab
                form={form}
                setField={setField}
                socialsText={socialsText}
                setSocialsText={setSocialsText}
              />
            </TabsContent>
            <TabsContent value="style">
              <StyleTab form={form} setField={setField} />
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex gap-2">
            <Button
              onClick={() => save.mutate()}
              disabled={save.isPending || form.name.trim().length === 0}
              data-testid="builder-save"
            >
              {save.isPending ? "Saving…" : isNew ? "Publish card" : "Save changes"}
            </Button>
            <Button variant="ghost" onClick={() => navigate("/cards")} data-testid="builder-cancel">
              Cancel
            </Button>
          </div>
        </div>

        <div className="lg:sticky lg:top-8 lg:self-start">
          <p className="label-caps mb-2">Real-time preview</p>
          <CardCanvas card={payload} testId="builder-preview" />
        </div>
      </div>
    </div>
  );
}
