// src/components/Footer.jsx
import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-green-900 to-emerald-900 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-4 gap-8">

        {/* About */}
        <div className="space-y-8">
          {/* <h2 className="text-xl font-bold">PUTTYBOX</h2> */}
           
          <span className="font-extrabold text-4xl">
            <span className="text-white-600">PUTTY</span>
            <span className="text-black">BOX</span>
          </span>
        
          <p className="text-gray-100/90">
            Your ultimate meal planning platform — choose, customize, and enjoy nutritious meals every day.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Quick Links</h3>
          <ul className="space-y-1">
            <li>
              <a href="/home" className="hover:text-blue-700 transition">Home</a>
            </li>
            <li>
              <a href="/mealplan" className="hover:text-gray-200 transition">Meal Plans</a>
            </li>
            <li>
              <a href="/quickorder" className="hover:text-gray-200 transition">Quick Order</a>
            </li>
            <li>
              <a href="/contact" className="hover:text-gray-200 transition">Contact</a>
            </li>
          </ul>
        </div>

        {/* Socials */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Follow Us</h3>
          <div className="flex gap-4 mt-2">
            <a href="#" className="hover:text-gray-200 transition"><FaFacebookF /></a>
            <a href="#" className="hover:text-gray-200 transition"><FaTwitter /></a>
            <a href="#" className="hover:text-gray-200 transition"><FaInstagram /></a>
            <a href="#" className="hover:text-gray-200 transition"><FaLinkedinIn /></a>
          </div>
        </div>

        {/* Newsletter */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Subscribe</h3>
          <p className="text-gray-70/90">Get updates and offers delivered straight to your inbox.</p>
          <form className="flex flex-col sm:flex-row gap-2 mt-2">
            <input
              type="email"
              placeholder="Your email"
              className="px-4 py-2 rounded-lg text-white-700 focus:outline-none flex-1"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition"
            >
              Subscribe
            </button>
          </form>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="mt-10 text-center text-gray-100/80 text-sm">
        &copy; {new Date().getFullYear()} PUTTYBOX. All rights reserved.
      </div>
    </footer>
  );
}
