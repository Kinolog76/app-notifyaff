import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { createClient } from "@/utils/supabase/server";

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("/api/links", () => {
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

      const request = new Request("http://localhost:3000/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: "https://example.com",
          name: "Test Link",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 400 if validation fails", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
      });

      const request = new Request("http://localhost:3000/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: "invalid-url",
          name: "Test Link",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation failed");
      expect(data.details).toBeDefined();
    });

    it("should create link successfully", async () => {
      const mockUser = { id: "user-123" };
      const mockLink = {
        id: "link-123",
        user_id: "user-123",
        url: "https://example.com",
        name: "Test Link",
        category: null,
        tags: null,
        short_url: null,
        status: "active",
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockLink,
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      const request = new Request("http://localhost:3000/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: "https://example.com",
          name: "Test Link",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe("Link created successfully");
      expect(data.data).toEqual(mockLink);
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: "user-123",
        url: "https://example.com",
        name: "Test Link",
        category: null,
        tags: null,
        short_url: null,
        status: "active",
      });
    });

    it("should handle database errors", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
      });

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Database error" },
            }),
          }),
        }),
      });

      const request = new Request("http://localhost:3000/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: "https://example.com",
          name: "Test Link",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to create link");
    });
  });

  describe("GET", () => {
    it("should return 401 if user is not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const request = new Request("http://localhost:3000/api/links");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should fetch all links for authenticated user", async () => {
      const mockUser = { id: "user-123" };
      const mockLinks = [
        {
          id: "link-1",
          user_id: "user-123",
          url: "https://example1.com",
          name: "Link 1",
          status: "active",
        },
        {
          id: "link-2",
          user_id: "user-123",
          url: "https://example2.com",
          name: "Link 2",
          status: "active",
        },
      ];

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });

      const mockOrder = vi.fn().mockResolvedValue({
        data: mockLinks,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: mockOrder,
          }),
        }),
      });

      const request = new Request("http://localhost:3000/api/links");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockLinks);
    });

    it("should filter by category", async () => {
      const mockUser = { id: "user-123" };
      const mockLinks = [
        {
          id: "link-1",
          user_id: "user-123",
          url: "https://example1.com",
          name: "Link 1",
          category: "social",
          status: "active",
        },
      ];

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });

      const mockEqCategory = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockLinks,
          error: null,
        }),
      });

      const mockEqUserId = vi.fn().mockReturnValue({
        eq: mockEqCategory,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: mockEqUserId,
        }),
      });

      const request = new Request(
        "http://localhost:3000/api/links?category=social"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockLinks);
    });

    it("should filter by status", async () => {
      const mockUser = { id: "user-123" };
      const mockLinks = [
        {
          id: "link-1",
          user_id: "user-123",
          url: "https://example1.com",
          name: "Link 1",
          status: "broken",
        },
      ];

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });

      const mockEqStatus = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockLinks,
          error: null,
        }),
      });

      const mockEqUserId = vi.fn().mockReturnValue({
        eq: mockEqStatus,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: mockEqUserId,
        }),
      });

      const request = new Request(
        "http://localhost:3000/api/links?status=broken"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockLinks);
    });

    it("should handle database errors", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Database error" },
            }),
          }),
        }),
      });

      const request = new Request("http://localhost:3000/api/links");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to fetch links");
    });
  });
});
