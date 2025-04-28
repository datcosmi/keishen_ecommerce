"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Save,
  X,
  Trash2,
  Check,
  AlertCircle,
  RefreshCw,
  FacebookIcon,
  InstagramIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface PageContent {
  id_pc: number;
  section: string;
  key: string;
  value: string;
  isEditing?: boolean;
  newValue?: string;
}

interface ContentItem extends PageContent {
  isEditing: boolean;
  newValue: string;
}

interface ContentMap {
  [key: string]: ContentItem;
}

interface ContentPreviewProps {
  section: string;
  content: ContentMap;
}

interface GroupedContent {
  [section: string]: {
    [key: string]: PageContent;
  };
}

interface EditableContent extends PageContent {
  isEditing: boolean;
  newValue: string;
}

interface EditableSection {
  [key: string]: EditableContent;
}

interface EditableSections {
  [section: string]: EditableSection;
}

const ContentPreview: React.FC<ContentPreviewProps> = ({
  section,
  content,
}) => {
  // Create a more accessible format for content values
  const contentByKey: Record<string, string> = {};
  Object.entries(content).forEach(([key, item]) => {
    contentByKey[key] = item.value;
  });

  if (section === "about-us" || section === "about_us") {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold mb-3 flex items-center">
          <UserGroupIcon className="w-5 h-5 text-yellow-400 mr-2" />
          Vista previa: Sobre Nosotros
        </h3>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-400">
          {Object.entries(content)
            .filter(([key]) => key.startsWith("paragraph_"))
            .sort(([keyA], [keyB]) => {
              const numA = parseInt(keyA.split("_")[1]);
              const numB = parseInt(keyB.split("_")[1]);
              return numA - numB;
            })
            .map(([key, item]) => (
              <p
                key={key}
                className="text-gray-700 mb-3 text-sm leading-relaxed"
              >
                {item.value}
              </p>
            ))}
        </div>
      </div>
    );
  } else if (section === "contact") {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold mb-3">
          Vista previa: Información de Contacto
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {/* Location */}
          {content.location && (
            <div className="flex items-start space-x-3">
              <div className="bg-yellow-400 p-2 rounded-lg">
                <MapPinIcon className="w-4 h-4 text-black" />
              </div>
              <div>
                <h4 className="font-medium">Dirección</h4>
                <p className="text-gray-600 mt-1">{content.location.value}</p>
              </div>
            </div>
          )}

          {/* Phone */}
          {content.phone && (
            <div className="flex items-start space-x-3">
              <div className="bg-yellow-400 p-2 rounded-lg">
                <PhoneIcon className="w-4 h-4 text-black" />
              </div>
              <div>
                <h4 className="font-medium">Teléfono</h4>
                <p className="text-gray-600 mt-1">{content.phone.value}</p>
              </div>
            </div>
          )}

          {/* Email */}
          {content.email && (
            <div className="flex items-start space-x-3">
              <div className="bg-yellow-400 p-2 rounded-lg">
                <EnvelopeIcon className="w-4 h-4 text-black" />
              </div>
              <div>
                <h4 className="font-medium">Email</h4>
                <p className="text-gray-600 mt-1">{content.email.value}</p>
              </div>
            </div>
          )}

          {/* Social media - using simple text placeholders for icons */}
          {(content.facebook || content.instagram) && (
            <div className="flex items-start space-x-3">
              <div className="flex space-x-2">
                {content.facebook && (
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <span className="w-4 h-4 text-white text-xs">
                      <FacebookIcon></FacebookIcon>
                    </span>
                  </div>
                )}
                {content.instagram && content.instagram.value && (
                  <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-2 rounded-lg">
                    <span className="w-4 h-4 text-white text-xs">
                      <InstagramIcon></InstagramIcon>
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-medium">Redes Sociales</h4>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } else if (section === "schedule") {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold mb-3 flex items-center">
          <ClockIcon className="w-5 h-5 text-yellow-400 mr-2" />
          Vista previa: Horario
        </h3>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          {Object.entries(content)
            .filter(([key]) => key.startsWith("paragraph_"))
            .sort(([keyA], [keyB]) => {
              const numA = parseInt(keyA.split("_")[1]);
              const numB = parseInt(keyB.split("_")[1]);
              return numA - numB;
            })
            .map(([key, item]) => (
              <p key={key} className="text-gray-700 text-sm">
                {item.value}
              </p>
            ))}
        </div>
      </div>
    );
  } else if (section === "location") {
    const mapUrl = content.map_embed_url ? content.map_embed_url.value : "";
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold mb-3">Vista previa: Ubicación</h3>
        {mapUrl && (
          <div className="w-full h-48 rounded-lg overflow-hidden border-2 border-white shadow-md">
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        )}
      </div>
    );
  }

  return null;
};

const PageContentDashboard: React.FC = () => {
  const [pageContents, setPageContents] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editableContents, setEditableContents] = useState<EditableSections>(
    {}
  );
  const [activeTab, setActiveTab] = useState<string>("");
  const [newParagraphValues, setNewParagraphValues] = useState<{
    [section: string]: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Get token from session
  const { data: session } = useSession();
  const token = session?.accessToken;

  const SECTION_DESCRIPTIONS: { [key: string]: string } = {
    "about-us":
      "Información principal sobre la empresa que aparece en la sección 'Sobre Nosotros'.",
    contact: "Datos de contacto que se muestran en varias partes del sitio.",
    schedule: "Horarios de atención que aparecen en la sección de contacto.",
    location: "Ubicación física de la empresa y mapa embebido.",
  };

  const SECTION_TRANSLATIONS: { [key: string]: string } = {
    "about-us": "Sobre Nosotros",
    about_us: "Sobre Nosotros",
    contact: "Contacto",
    schedule: "Horario",
    location: "Ubicación",
  };

  const KEY_TRANSLATIONS: { [key: string]: string } = {
    paragraph_1: "Párrafo 1",
    paragraph_2: "Párrafo 2",
    paragraph_3: "Párrafo 3",
    paragraph_4: "Párrafo 4",
    paragraph_5: "Párrafo 5",
    map_embed_url: "URL de Mapa Embebido",
    location: "Ubicación",
    phone: "Teléfono",
    email: "Correo Electrónico",
    facebook: "Facebook",
    instagram: "Instagram",
  };

  const SECTION_ICONS: { [key: string]: React.ReactNode } = {
    "about-us": <UserGroupIcon className="h-5 w-5 text-yellow-400" />,
    contact: <PhoneIcon className="h-5 w-5 text-yellow-400" />,
    schedule: <ClockIcon className="h-5 w-5 text-yellow-400" />,
    location: <MapPinIcon className="h-5 w-5 text-yellow-400" />,
  };

  // Fetch page contents on component mount
  useEffect(() => {
    fetchPageContents();
  }, []);

  const fetchPageContents = async () => {
    setLoading(true);
    setError(null);
    setRefreshing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/page-content`);
      if (!response.ok) {
        throw new Error(`Error fetching page contents: ${response.statusText}`);
      }
      const data = await response.json();
      setPageContents(data);

      // Add Instagram key to contact section if it doesn't exist
      const hasInstagram = data.some(
        (item: any) => item.section === "contact" && item.key === "instagram"
      );

      if (!hasInstagram) {
        data.push({
          id_pc: -1, // Temporary ID
          section: "contact",
          key: "instagram",
          value: "", // Empty by default
        });
      }

      // Group and prepare data for editing
      const grouped = groupContentsBySection(data);
      setEditableContents(prepareEditableContents(grouped));

      // Set default active tab to the first section
      const sections = Object.keys(grouped);
      if (sections.length > 0 && !activeTab) {
        setActiveTab(sections[0]);
        // Initialize all sections as expanded
        setExpandedSections(
          sections.flatMap((section) =>
            Object.keys(grouped[section]).map((key) => `${section}-${key}`)
          )
        );
      }
    } catch (error) {
      console.error("Error fetching page contents:", error);
      setError(
        "Error al cargar el contenido de la página. Por favor, intente de nuevo más tarde."
      );
      toast.error("Error al cargar el contenido de la página");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Group page contents by section and key for easier management
  const groupContentsBySection = (contents: PageContent[]): GroupedContent => {
    return contents.reduce((acc, content) => {
      // Normalize section names (replace underscores with hyphens)
      const normalizedSection = content.section.replace("_", "-");

      if (!acc[normalizedSection]) {
        acc[normalizedSection] = {};
      }
      acc[normalizedSection][content.key] = content;
      return acc;
    }, {} as GroupedContent);
  };

  // Prepare content for editing with additional fields
  const prepareEditableContents = (
    grouped: GroupedContent
  ): EditableSections => {
    const result: EditableSections = {};

    Object.entries(grouped).forEach(([section, contents]) => {
      result[section] = {};
      Object.entries(contents).forEach(([key, content]) => {
        result[section][key] = {
          ...content,
          isEditing: false,
          newValue: content.value,
        };
      });
    });

    return result;
  };

  // Toggle editing state for a content item
  const toggleEditing = (section: string, key: string) => {
    setEditableContents((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (!updated[section]) {
        updated[section] = {};
      }
      if (!updated[section][key]) {
        console.error(`Key ${key} not found in section ${section}`);
        return prev; // Return previous state unchanged if key doesn't exist
      }

      // Ensure the section is expanded when editing
      if (!expandedSections.includes(`${section}-${key}`)) {
        setExpandedSections((prevSections) => [
          ...prevSections,
          `${section}-${key}`,
        ]);
      }

      updated[section][key] = {
        ...updated[section][key],
        isEditing: !updated[section][key].isEditing,
        newValue: updated[section][key].value, // Reset new value to current value when toggling
      };

      if (!expandedSections.includes(`${section}-${key}`)) {
        setExpandedSections((prevSections) => [
          ...prevSections,
          `${section}-${key}`,
        ]);
      }

      return updated;
    });
  };

  // Handle input change for a content item
  const handleInputChange = (section: string, key: string, value: string) => {
    setEditableContents((prev) => {
      const updated = { ...prev };
      if (!updated[section]) updated[section] = {};
      if (!updated[section][key]) return prev;

      updated[section][key] = {
        ...updated[section][key],
        newValue: value,
      };
      return updated;
    });
  };

  // Handle new paragraph input change
  const handleNewParagraphChange = (section: string, value: string) => {
    setNewParagraphValues((prev) => ({
      ...prev,
      [section]: value,
    }));
  };

  // Save edited content
  const saveContent = async (section: string, key: string) => {
    const content = editableContents[section][key];
    if (!content || content.newValue === content.value) {
      toggleEditing(section, key);
      return;
    }

    setSubmitting(true);
    try {
      // If this is a new field (like instagram with id_pc -1)
      if (content.id_pc === -1) {
        const response = await fetch(`${API_BASE_URL}/api/page-content`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            section: content.section,
            key: content.key,
            value: content.newValue,
          }),
        });

        if (!response.ok) {
          throw new Error(`Error creating content: ${response.statusText}`);
        }

        const newContent = await response.json();

        // Check if we have a valid response with id_pc
        if (newContent && newContent.id_pc) {
          // Update state with the newly created content
          setPageContents((prev) => [
            ...prev.filter(
              (item) => !(item.section === section && item.key === key)
            ),
            newContent,
          ]);

          setEditableContents((prev) => {
            const updated = { ...prev };
            if (!updated[section]) updated[section] = {};

            updated[section][key] = {
              ...updated[section][key],
              id_pc: newContent.id_pc,
              value: content.newValue,
              isEditing: false,
            };
            return updated;
          });
        } else {
          // Handle the case where the API returned a response but without a valid id_pc
          console.warn("API response missing id_pc:", newContent);

          // Create a fallback ID or use an existing one
          const fallbackId = Date.now(); // Generate a temporary unique ID

          setPageContents((prev) => [
            ...prev.filter(
              (item) => !(item.section === section && item.key === key)
            ),
            {
              ...content,
              id_pc: fallbackId,
              value: content.newValue,
            },
          ]);

          setEditableContents((prev) => {
            const updated = { ...prev };
            if (!updated[section]) updated[section] = {};

            updated[section][key] = {
              ...updated[section][key],
              id_pc: fallbackId,
              value: content.newValue,
              isEditing: false,
            };
            return updated;
          });
        }

        toast.success("Contenido actualizado correctamente");
      } else {
        // Regular update for existing content
        const response = await fetch(
          `${API_BASE_URL}/api/page-content/${content.id_pc}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              section: content.section,
              key: content.key,
              value: content.newValue,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Error updating content: ${response.statusText}`);
        }

        // Update state
        setEditableContents((prev) => {
          const updated = { ...prev };
          updated[section][key] = {
            ...updated[section][key],
            value: content.newValue,
            isEditing: false,
          };
          return updated;
        });

        setPageContents((prev) =>
          prev.map((item) =>
            item.id_pc === content.id_pc
              ? { ...item, value: content.newValue }
              : item
          )
        );

        toast.success("Contenido actualizado correctamente");
      }
    } catch (error) {
      console.error("Error updating content:", error);
      toast.error("Error al actualizar el contenido");
    } finally {
      setSubmitting(false);
    }
  };

  // Add new paragraph to a section
  const addNewParagraph = async (section: string) => {
    const value = newParagraphValues[section];
    if (!value || value.trim() === "") {
      toast.error("El párrafo no puede estar vacío");
      return;
    }

    // Determine the next paragraph number
    const paragraphKeys = Object.keys(editableContents[section] || {})
      .filter((key) => key.startsWith("paragraph_"))
      .map((key) => parseInt(key.split("_")[1]))
      .sort((a, b) => a - b);

    const nextNumber =
      paragraphKeys.length > 0 ? Math.max(...paragraphKeys) + 1 : 1;
    const newKey = `paragraph_${nextNumber}`;

    setSubmitting(true);
    try {
      // Fix the URL path - remove the "page-content" duplication
      const response = await fetch(`${API_BASE_URL}/api/page-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          section,
          key: newKey,
          value,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error adding new paragraph: ${response.statusText}`);
      }

      // After successful addition, refresh the data
      await fetchPageContents();

      // Clear input
      setNewParagraphValues((prev) => ({
        ...prev,
        [section]: "",
      }));

      toast.success("Párrafo añadido correctamente");
    } catch (error) {
      console.error("Error adding new paragraph:", error);
      toast.error("Error al añadir el párrafo");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete content
  const deleteContent = async (section: string, key: string) => {
    const content = editableContents[section][key];
    if (!content) return;

    setSubmitting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/page-content/${content.id_pc}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error deleting content: ${response.statusText}`);
      }

      // After successful deletion, refresh the data
      await fetchPageContents();

      toast.success("Contenido eliminado correctamente");
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error("Error al eliminar el contenido");
    } finally {
      setSubmitting(false);
    }
  };

  // Check if a key is a paragraph
  const isParagraph = (key: string) => {
    return key.startsWith("paragraph_");
  };

  // Get nice display name for a key
  const getDisplayName = (key: string) => {
    // Use translation if available
    return (
      KEY_TRANSLATIONS[key] ||
      key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  };

  // Get section title
  const getSectionTitle = (section: string) => {
    // Use translation if available
    return (
      SECTION_TRANSLATIONS[section] ||
      section
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  };

  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Administración de Contenido</h1>
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="flex items-center p-4 mb-6 text-red-800 border-t-4 border-red-300 bg-red-50">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
        <Button onClick={fetchPageContents}>Intentar de nuevo</Button>
      </div>
    );
  }

  const sections = Object.keys(editableContents);

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8 pb-4 border-b">
        <div className="flex items-center">
          <div className="bg-yellow-400 p-2 rounded-lg mr-4">
            <Pencil className="h-6 w-6 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Administración de Contenido</h1>
            <p className="text-gray-500">
              Actualiza y gestiona el contenido de tu sitio web
            </p>
          </div>
        </div>
        <Button
          onClick={fetchPageContents}
          variant="outline"
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Actualizar
        </Button>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500 mb-4">
            No hay contenido disponible
          </p>
          <Button onClick={fetchPageContents}>Actualizar</Button>
        </div>
      ) : (
        <div className="space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-6 flex flex-wrap h-auto bg-gray-100 p-1 rounded-lg">
              {sections.map((section) => (
                <TabsTrigger
                  key={section}
                  value={section}
                  className={`py-2 px-4 ${activeTab === section ? "bg-white shadow-sm" : ""}`}
                >
                  <div className="flex items-center">
                    {SECTION_ICONS[section] && (
                      <span className="mr-2">{SECTION_ICONS[section]}</span>
                    )}
                    {getSectionTitle(section)}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {sections.map((section) => (
              <TabsContent key={section} value={section} className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="mr-3">
                      {SECTION_ICONS[section] || (
                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold">
                        {getSectionTitle(section)}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {SECTION_DESCRIPTIONS[section] ||
                          "Contenido editable de la página."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preview of how this section looks on the site */}
                <div className="mb-6">
                  <ContentPreview
                    section={section}
                    content={editableContents[section] || {}}
                  />
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-medium mb-4 pb-2 border-b">
                    Editar contenido
                  </h3>

                  <Accordion
                    type="multiple"
                    value={expandedSections}
                    onValueChange={setExpandedSections}
                    className="w-full"
                  >
                    {/* Content Items - keep your existing code here but style it better */}
                    {Object.entries(editableContents[section] || {}).map(
                      ([key, content]) => (
                        <AccordionItem
                          key={key}
                          value={`${section}-${key}`}
                          className="border-b border-gray-200 py-2"
                        >
                          <AccordionTrigger className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 rounded-md">
                            <div className="text-left flex items-center">
                              {key.includes("paragraph") ? (
                                <div className="w-6 h-6 bg-yellow-400 rounded-md mr-3 flex items-center justify-center text-xs font-medium text-black">
                                  {key.split("_")[1]}
                                </div>
                              ) : (
                                <div className="w-6 h-6 bg-gray-200 rounded-md mr-3 flex items-center justify-center">
                                  <span className="text-sm">
                                    {key.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <span className="font-medium">
                                {getDisplayName(key)}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="p-4 border border-gray-100 rounded-md mt-2">
                            <div className="space-y-4">
                              {content.isEditing ? (
                                <div className="space-y-2">
                                  {key === "map_embed_url" ? (
                                    <div className="space-y-2">
                                      <Label htmlFor={`edit-${section}-${key}`}>
                                        {getDisplayName(key)}
                                      </Label>
                                      <Input
                                        id={`edit-${section}-${key}`}
                                        value={content.newValue}
                                        onChange={(e) =>
                                          handleInputChange(
                                            section,
                                            key,
                                            e.target.value
                                          )
                                        }
                                        className="w-full"
                                      />
                                      <div className="p-2 bg-gray-50 border rounded-md">
                                        <p className="text-sm text-gray-500 mb-2">
                                          Vista previa:
                                        </p>
                                        <div className="w-full h-48 lg:h-64 bg-gray-200 rounded-md overflow-hidden">
                                          <iframe
                                            src={content.newValue}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                          ></iframe>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <Label htmlFor={`edit-${section}-${key}`}>
                                        {getDisplayName(key)}
                                      </Label>
                                      <Textarea
                                        id={`edit-${section}-${key}`}
                                        value={content.newValue}
                                        onChange={(e) =>
                                          handleInputChange(
                                            section,
                                            key,
                                            e.target.value
                                          )
                                        }
                                        className="w-full min-h-20"
                                      />

                                      {/* Add real-time preview for paragraphs */}
                                      {(key.startsWith("paragraph_") ||
                                        key === "location" ||
                                        key === "phone" ||
                                        key === "email") && (
                                        <div className="p-3 bg-gray-50 border rounded-md mt-2">
                                          <p className="text-xs text-gray-500 mb-1">
                                            Vista previa:
                                          </p>
                                          <div
                                            className={`${
                                              key.startsWith("paragraph_")
                                                ? "bg-white p-2 rounded border-l-4 border-yellow-400"
                                                : ""
                                            }`}
                                          >
                                            <p className="text-gray-700 text-sm whitespace-pre-wrap">
                                              {content.newValue}
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        toggleEditing(section, key)
                                      }
                                      disabled={submitting}
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      Cancelar
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => saveContent(section, key)}
                                      disabled={
                                        submitting ||
                                        (content.newValue === content.value &&
                                          content.id_pc !== -1)
                                      }
                                    >
                                      <Save className="h-4 w-4 mr-1" />
                                      Guardar
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {key === "map_embed_url" ? (
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium text-gray-500">
                                        {getDisplayName(key)}:
                                      </p>
                                      <div className="mt-1 bg-gray-50 p-3 rounded-md border border-gray-200">
                                        <p className="text-gray-800 font-mono text-sm break-all">
                                          {content.value || (
                                            <span className="text-gray-400 italic">
                                              Sin contenido - Haga clic en
                                              "Editar" para añadir
                                            </span>
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <p className="text-sm font-medium text-gray-500">
                                        {getDisplayName(key)}:
                                      </p>
                                      <div
                                        className={`mt-1 ${
                                          key.startsWith("paragraph_")
                                            ? "bg-white p-3 rounded-md border-l-4 border-yellow-400"
                                            : ""
                                        }`}
                                      >
                                        <p className="text-gray-800 whitespace-pre-wrap">
                                          {content.value || (
                                            <span className="text-gray-400 italic">
                                              Sin contenido - Haga clic en
                                              "Editar" para añadir
                                            </span>
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        toggleEditing(section, key)
                                      }
                                    >
                                      <Pencil className="h-4 w-4 mr-1" />
                                      Editar
                                    </Button>

                                    {isParagraph(key) && (
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                          >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Eliminar
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>
                                              ¿Está seguro?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Esta acción no se puede deshacer.
                                              Esto eliminará permanentemente
                                              este contenido de la base de
                                              datos.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>
                                              Cancelar
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() =>
                                                deleteContent(section, key)
                                              }
                                              className="bg-red-600 hover:bg-red-700"
                                            >
                                              Eliminar
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )
                    )}
                  </Accordion>

                  {/* Add new paragraph section (only for sections that have paragraphs) */}
                  {Object.keys(editableContents[section] || {}).some((key) =>
                    isParagraph(key)
                  ) && (
                    <Card className="mt-6 border-t-4 border-yellow-400">
                      <CardHeader className="bg-gray-50">
                        <CardTitle className="flex items-center">
                          <Plus className="h-5 w-5 mr-2 text-yellow-400" />
                          Añadir nuevo párrafo
                        </CardTitle>
                        <CardDescription>
                          Añade un nuevo párrafo a la sección{" "}
                          {getSectionTitle(section)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <Textarea
                          placeholder="Escribe el contenido del nuevo párrafo aquí..."
                          value={newParagraphValues[section] || ""}
                          onChange={(e) =>
                            handleNewParagraphChange(section, e.target.value)
                          }
                          className="min-h-24"
                        />

                        {/* Add preview for new paragraph */}
                        {newParagraphValues[section] &&
                          newParagraphValues[section].trim() !== "" && (
                            <div className="mt-4 p-3 bg-gray-50 border rounded-md">
                              <p className="text-xs text-gray-500 mb-1">
                                Vista previa:
                              </p>
                              <div className="bg-white p-3 rounded border-l-4 border-yellow-400">
                                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                                  {newParagraphValues[section]}
                                </p>
                              </div>
                            </div>
                          )}
                      </CardContent>
                      <CardFooter className="flex justify-end bg-gray-50">
                        <Button
                          onClick={() => addNewParagraph(section)}
                          disabled={
                            !newParagraphValues[section] ||
                            newParagraphValues[section].trim() === "" ||
                            submitting
                          }
                          className="bg-yellow-400 hover:bg-yellow-500 text-black"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Añadir Párrafo
                        </Button>
                      </CardFooter>
                    </Card>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default PageContentDashboard;
