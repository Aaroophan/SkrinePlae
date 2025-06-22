"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ProjectMetadata } from "@/lib/screenplay-manager"

interface TitlePageGeneratorProps {
    metadata: ProjectMetadata
}

export function TitlePageGenerator({ metadata }: TitlePageGeneratorProps) {
    const { titlePage } = metadata

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    Title Page Preview
                    <Badge variant="outline">{metadata.format}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div
                    className="bg-white p-12 rounded border font-mono text-sm leading-relaxed min-h-[600px]"
                    style={{
                        fontFamily: "Courier New, monospace",
                        fontSize: `${metadata.fontSize}pt`,
                        lineHeight: metadata.lineSpacing,
                    }}
                >
                    {/* Title Page Layout */}
                    <div className="text-center space-y-8">
                        <div className="mt-32">
                            <h1 className="text-2xl font-bold uppercase underline mb-8">{titlePage.title}</h1>

                            {titlePage.basedOn && (
                                <div className="mb-8">
                                    <div>Based on</div>
                                    <div className="font-bold">{titlePage.basedOn}</div>
                                </div>
                            )}

                            <div className="mb-16">
                                <div>Written by</div>
                                <div className="font-bold mt-2">{titlePage.author}</div>
                            </div>
                        </div>

                        <div className="absolute bottom-12 left-12 right-12">
                            <div className="flex justify-between text-xs">
                                <div>
                                    {titlePage.revision && <div>{titlePage.revision}</div>}
                                    {titlePage.draftDate && <div>{titlePage.draftDate}</div>}
                                </div>

                                {titlePage.contact && (
                                    <div className="text-right">
                                        <div>Contact:</div>
                                        <div>{titlePage.contact}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
