import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { createClient } from "@/utils/supabase/server";

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("/api/links/bulk-import", () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase);
  });

  describe("POST", () => {
    it("should return 401 if user is not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const request = new Request(
        "http://localhost:3000/api/links/bulk-import",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            links: [
              { url: "https://example.com", name: "Test Link" },
            ],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 400 if validation fails", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
      });

      const request = new Request(
        "http://localhost:3000/api/links/bulk-import",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            links: [
              { url: "invalid-url", name: "Test Link" },
            ],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation failed");
      expect(data.details).toBeDefined();
    });

    it("should return 400 if no links provided", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
      });

      const request = new Request(
        "http://localhost:3000/api/links/bulk-import",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            links: [],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("No links provided");
    });

    it("should import single link successfully", async () => {
      const mockUser = { id: "user-123" };
      const mockLink = {
        id: "link-123",
        user_id: "user-123",
        url: "https://example.com",
        name: "Test Link",
        category: null,
        tags: null,
        status: "active",
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: [mockLink],
            error: null,
          }),
        }),
      });

      const request = new Request(
        "http://localhost:3000/api/links/bulk-import",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            links: [
              {
                url: "https://example.com",
                name: "Test Link",
              },
            ],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe("Successfully imported 1 link");
      expect(data.data).toEqual([mockLink]);
    });

    it("should import multiple links successfully", async () => {
      const mockUser = { id: "user-123" };
      const mockLinks = [
        {
          id: "link-1",
          user_id: "user-123",
          url: "https://example1.com",
          name: "Link 1",
          category: "social",
          tags: "tag1",
          status: "active",
        },
        {
          id: "link-2",
          user_id: "user-123",
          url: "https://example2.com",
          name: "Link 2",
          category: null,
          tags: null,
          status: "active",
        },
      ];

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: mockLinks,
          error: null,
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      const request = new Request(
        "http://localhost:3000/api/links/bulk-import",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            links: [
              {
                url: "https://example1.com",
                name: "Link 1",
                category: "social",
                tags: "tag1",
              },
              {
                url: "https://example2.com",
                name: "Link 2",
              },
            ],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe("Successfully imported 2 links");
      expect(data.data).toEqual(mockLinks);
      expect(mockInsert).toHaveBeenCalledWith([
        {
          user_id: "user-123",
          url: "https://example1.com",
          name: "Link 1",
          category: "social",
          tags: "tag1",
          status: "active",
        },
        {
          user_id: "user-123",
          url: "https://example2.com",
          name: "Link 2",
          category: null,
          tags: null,
          status: "active",
        },
      ]);
    });

    it("should handle database errors", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
      });

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Database error" },
          }),
        }),
      });

      const request = new Request(
        "http://localhost:3000/api/links/bulk-import",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            links: [
              { url: "https://example.com", name: "Test Link" },
            ],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to import links");
    });

    it("should handle missing name field", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
      });

      const request = new Request(
        "http://localhost:3000/api/links/bulk-import",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            links: [
              { url: "https://example.com" },
            ],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation failed");
    });
  });
});
