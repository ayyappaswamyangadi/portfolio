import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { projects } from "@/lib/projects";
import { StructuredData } from "./StructuredData";

describe("StructuredData", () => {
  it("renders exactly one application/ld+json script tag", () => {
    const { container } = render(<StructuredData />);
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts).toHaveLength(1);
  });

  it("contains valid, parseable JSON with a Person and a WebSite node", () => {
    const { container } = render(<StructuredData />);
    const script = container.querySelector('script[type="application/ld+json"]')!;
    const data = JSON.parse(script.innerHTML);

    expect(data["@context"]).toBe("https://schema.org");
    expect(Array.isArray(data["@graph"])).toBe(true);

    const person = data["@graph"].find((n: { "@type": string }) => n["@type"] === "Person");
    const website = data["@graph"].find((n: { "@type": string }) => n["@type"] === "WebSite");

    expect(person).toMatchObject({
      name: "Ayyappa Swamy Angadi",
      alternateName: "Ayyappa",
      jobTitle: "Frontend Developer",
    });
    expect(person.sameAs).toEqual(
      expect.arrayContaining([
        "https://github.com/ayyappaswamyangadi",
        "https://linkedin.com/in/ayyappaswamyangadi",
      ]),
    );
    expect(person.address).toMatchObject({
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    });

    expect(website).toMatchObject({
      name: "Ayyappa Portfolio",
      inLanguage: "en-US",
    });
    expect(website.publisher).toEqual({ "@id": person["@id"] });
  });

  it("describes the web-development service and lists every project, not just the paginated first page", () => {
    const { container } = render(<StructuredData />);
    const data = JSON.parse(
      container.querySelector('script[type="application/ld+json"]')!.innerHTML,
    );
    const person = data["@graph"].find((n: { "@type": string }) => n["@type"] === "Person");
    const service = data["@graph"].find((n: { "@type": string }) => n["@type"] === "ProfessionalService");
    const list = data["@graph"].find((n: { "@type": string }) => n["@type"] === "ItemList");

    expect(service).toMatchObject({
      name: "Ayyappa - Frontend Web Development Services",
      provider: { "@id": person["@id"] },
    });
    expect(list.itemListElement).toHaveLength(projects.length);
    expect(list.itemListElement.map((e: { item: { name: string } }) => e.item.name)).toEqual(
      projects.map((p) => p.title),
    );
  });
});
