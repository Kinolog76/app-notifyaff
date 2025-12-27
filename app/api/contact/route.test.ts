import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

vi.mock("resend", () => {
  const mockSend = vi.fn();
  return {
    Resend: vi.fn().mockImplementation(() => ({
      emails: {
        send: mockSend,
      },
    })),
  };
});

describe("/api/contact", () => {
  let mockResendSend: any;

  beforeEach(() => {
    const { Resend } = require("resend");
    const resendInstance = new Resend();
    mockResendSend = resendInstance.emails.send;
    mockResendSend.mockReset();
  });

  describe("POST", () => {
    it("should return 400 if required fields are missing", async () => {
      const request = new Request("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "John",
          lastName: "Doe",
          // missing email, subject, message
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("All fields are required");
    });

    it("should return 400 if email format is invalid", async () => {
      const request = new Request("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "John",
          lastName: "Doe",
          email: "invalid-email",
          subject: "Test Subject",
          message: "Test message",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid email format");
    });

    it("should send email successfully with valid data", async () => {
      mockResendSend.mockResolvedValue({
        data: { id: "email-123" },
        error: null,
      });

      const request = new Request("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          subject: "Test Subject",
          message: "Test message content",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe("Email sent successfully");
      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "NotifyAff Contact <onboarding@resend.dev>",
          replyTo: "john@example.com",
          subject: "Contact Form: Test Subject",
        })
      );
    });

    it("should include proper email content", async () => {
      mockResendSend.mockResolvedValue({
        data: { id: "email-123" },
        error: null,
      });

      const request = new Request("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "Jane",
          lastName: "Smith",
          email: "jane@example.com",
          subject: "Bug Report",
          message: "Found a bug in the system",
        }),
      });

      const response = await POST(request);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining("Jane Smith"),
        })
      );

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining("jane@example.com"),
        })
      );

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining("Found a bug in the system"),
        })
      );
    });

    it("should handle Resend API errors", async () => {
      mockResendSend.mockResolvedValue({
        data: null,
        error: { message: "API Error" },
      });

      const request = new Request("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          subject: "Test Subject",
          message: "Test message",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to send email");
    });

    it("should handle unexpected errors", async () => {
      mockResendSend.mockRejectedValue(new Error("Network error"));

      const request = new Request("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          subject: "Test Subject",
          message: "Test message",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });

    it("should validate all required fields individually", async () => {
      const fields = ["firstName", "lastName", "email", "subject", "message"];
      const validData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        subject: "Test",
        message: "Message",
      };

      for (const field of fields) {
        const incompleteData = { ...validData };
        delete incompleteData[field as keyof typeof incompleteData];

        const request = new Request("http://localhost:3000/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(incompleteData),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe("All fields are required");
      }
    });
  });
});
