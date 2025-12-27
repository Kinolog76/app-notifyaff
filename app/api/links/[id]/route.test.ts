import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PUT, PATCH, DELETE } from "./route";
import { createClient } from "@/utils/supabase/server";

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("/api/links/[id]", () => {
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

  describe("GET", () => {
    it("should return 401 if user is not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const request = new Request("http://localhost:3000/api/links/123");
      const response = await GET(request, {
        params: Promise.resolve({ id: "123" }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should fetch link by id successfully", async () => {
      const mockUser = { id: "user-123" };
      const mockLink = {
        id: "link-123",
        user_id: "user-123",
        url: "https://example.com",
        name: "Test Link",
        status: "active",
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });

      const mockSingle = vi.fn().mockResolvedValue({
        data: mockLink,
        error: null,
      });

      const mockEqUserId = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockEqId = vi.fn().mockReturnValue({
        eq: mockEqUserId,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: mockEqId,
        }),
      });

      const request = new Request("http://localhost:3000/api/links/link-123");
      const response = await GET(request, {
        params: Promise.resolve({ id: "link-123" }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockLink);
    });

    it("should return 404 if link not found", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "Not found" },
              }),
            }),
          }),
        }),
      });

      const request = new Request("http://localhost:3000/api/links/999");
      const response = await GET(request, {
        params: Promise.resolve({ id: "999" }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Link not found");
    });
  });

  describe("PUT", () => {
    it("should return 401 if user is not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const request = new Request("http://localhost:3000/api/links/123", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated Name" }),
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: "123" }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should update link successfully", async () => {
      const mockUser = { id: "user-123" };
      const updatedLink = {
        id: "link-123",
        user_id: "user-123",
        url: "https://example.com",
        name: "Updated Name",
        status: "active",
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });

      const mockSingle = vi.fn().mockResolvedValue({
        data: updatedLink,
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockEqUserId = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      const mockEqId = vi.fn().mockReturnValue({
        eq: mockEqUserId,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEqId,
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
      });

      const request = new Request("http://localhost:3000/api/links/link-123", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated Name" }),
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: "link-123" }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Link updated successfully");
      expect(data.data).toEqual(updatedLink);
    });

    it("should return 400 if validation fails", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
      });

      const request = new Request("http://localhost:3000/api/links/link-123", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "invalid-url" }),
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: "link-123" }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation failed");
    });

    it("should handle database errors", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
      });

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: "Database error" },
                }),
              }),
            }),
          }),
        }),
      });

      const request = new Request("http://localhost:3000/api/links/link-123", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated Name" }),
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: "link-123" }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to update link");
    });
  });

  describe("PATCH", () => {
    it("should return 401 if user is not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const request = new Request("http://localhost:3000/api/links/123", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "broken" }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: "123" }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should update link status successfully", async () => {
      const mockUser = { id: "user-123" };
      const updatedLink = {
        id: "link-123",
        user_id: "user-123",
        url: "https://example.com",
        name: "Test Link",
        status: "broken",
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: updatedLink,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      const request = new Request("http://localhost:3000/api/links/link-123", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "broken" }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: "link-123" }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Link updated successfully");
      expect(data.data.status).toBe("broken");
    });
  });

  describe("DELETE", () => {
    it("should return 401 if user is not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const request = new Request("http://localhost:3000/api/links/123", {
        method: "DELETE",
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: "123" }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should delete link successfully", async () => {
      const mockUser = { id: "user-123" };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });

      const mockEqUserId = vi.fn().mockResolvedValue({
        error: null,
      });

      const mockEqId = vi.fn().mockReturnValue({
        eq: mockEqUserId,
      });

      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: mockEqId,
        }),
      });

      const request = new Request("http://localhost:3000/api/links/link-123", {
        method: "DELETE",
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: "link-123" }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Link deleted successfully");
    });

    it("should handle database errors", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
      });

      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: { message: "Database error" },
            }),
          }),
        }),
      });

      const request = new Request("http://localhost:3000/api/links/link-123", {
        method: "DELETE",
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: "link-123" }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to delete link");
    });
  });
});
