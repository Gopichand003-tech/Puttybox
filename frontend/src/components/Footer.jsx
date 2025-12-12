// src/components/Footer.jsx
import React, { useState } from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // null | "loading" | "success" | "error"

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      // If you have a backend endpoint to handle subscriptions, replace the URL below.
      // Example: await fetch("/api/subscribe", { method: "POST", body: JSON.stringify({ email }), headers: { "Content-Type": "application/json" } })
      // For now we'll simulate a success response.
      await new Promise((res) => setTimeout(res, 600));
      setStatus("success");
      setEmail("");
    } catch (err) {
      console.error("Subscribe error:", err);
      setStatus("error");
    } finally {
      setTimeout(() => setStatus(null), 3000); // clear status after 3s
    }
  };

  return (
    <footer className="bg-gradient-to-r from-green-900 to-emerald-900 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* About */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img src="/puttylogo1.png" alt="Puttybox logo" className="w-12 h-12 object-contain" />
            <span className="font-extrabold text-2xl tracking-tight">
              <span className="text-white">PUTTY</span>
              <span className="text-emerald-300 ml-1">BOX</span>
            </span>
          </div>

          <p className="text-gray-200">
            Your ultimate meal planning platform — choose, customize, and enjoy nutritious meals every day.
          </p>

          <div className="flex gap-3 mt-2">
            <a
              href="#"
              aria-label="Facebook"
              className="p-2 rounded-full bg-white/8 hover:bg-white/12 transition"
            >
              <FaFacebookF className="w-4 h-4" />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="p-2 rounded-full bg-white/8 hover:bg-white/12 transition"
            >
              <FaTwitter className="w-4 h-4" />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="p-2 rounded-full bg-white/8 hover:bg-white/12 transition"
            >
              <FaInstagram className="w-4 h-4" />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="p-2 rounded-full bg-white/8 hover:bg-white/12 transition"
            >
              <FaLinkedinIn className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Quick Links</h3>
          <ul className="space-y-1">
            <li>
              <a href="/home" className="text-gray-200 hover:text-white transition">
                Home
              </a>
            </li>
            <li>
              <a href="/mealplan" className="text-gray-200 hover:text-white transition">
                Meal Plans
              </a>
            </li>
            <li>
              <a href="/quickorder" className="text-gray-200 hover:text-white transition">
                Quick Order
              </a>
            </li>
            <li>
              <a href="/contact" className="text-gray-200 hover:text-white transition">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Follow / Contact */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Get in touch</h3>
          <p className="text-gray-200">Have a question or want to partner? Reach out to us.</p>
          <a
            href="mailto:hello@puttybox.com"
            className="inline-block mt-2 text-sm text-emerald-200 hover:text-emerald-100 transition"
          >
            hello@puttybox.com
          </a>

          <div className="mt-4">
            <h4 className="font-medium text-sm text-gray-100">Follow Us</h4>
            <div className="flex gap-3 mt-2">
              <a href="#" aria-label="Facebook" className="text-gray-200 hover:text-white transition">
                <FaFacebookF className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-200 hover:text-white transition">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-200 hover:text-white transition">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-gray-200 hover:text-white transition">
                <FaLinkedinIn className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Subscribe</h3>
          <p className="text-gray-200">Get updates and offers delivered straight to your inbox.</p>

          <form onSubmit={handleSubscribe} className="mt-2 flex flex-col sm:flex-row gap-2">
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="px-4 py-2 rounded-lg bg-white/6 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 flex-1"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-white text-green-800 font-semibold rounded-lg hover:bg-gray-100 transition"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>

          {status === "success" && (
            <p className="mt-2 text-sm text-emerald-200">Subscribed — check your inbox!</p>
          )}
          {status === "error" && (
            <p className="mt-2 text-sm text-red-300">Please enter a valid email or try again.</p>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-10 text-center text-gray-200/80 text-sm">
        &copy; {new Date().getFullYear()} PUTTYBOX. All rights reserved.
      </div>
    </footer>
  );
}
