import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import {
  ArrowRightIcon,
  ChartBarIcon,
  UsersIcon,
  BoltIcon,
  ShieldCheckIcon,
  StarIcon,
  CheckIcon,
  PlayIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  UserGroupIcon,
  LightBulbIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";

export default function LandingPage(): JSX.Element {
  const [isScrolled, setIsScrolled] = useState(false);
  const { mode } = useTheme();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Business Development Manager, TechCorp",
      content:
        "Inspire has revolutionized our B2B outreach. The AI-powered opportunity discovery helped us identify 3 new enterprise clients within weeks, increasing our pipeline by 85%.",
      avatar: "/images/Humaaans/standing-1.svg",
    },
    {
      name: "Michael Chen",
      role: "Sales Director, GrowthLabs",
      content:
        "The web scraping and NLP capabilities are incredible. We now discover opportunities before our competitors even know they exist, giving us a massive competitive advantage.",
      avatar: "/images/Humaaans/sitting-1.svg",
    },
    {
      name: "Jessica Williams",
      role: "Strategic Partnerships Lead, Enterprise Solutions",
      content:
        "Inspire's personalized recommendations have transformed our approach to B2B sales. We're now reaching out with highly relevant proposals that actually resonate with prospects.",
      avatar: "/images/Humaaans/standing-2.svg",
    },
  ];

  const features = [
    {
      icon: ChartBarIcon,
      title: "AI-Powered Web Scraping",
      description:
        "Intelligent data extraction from news sources, company websites, and social media to gather real-time insights about your target companies.",
      color: "from-blue-500 to-blue-700",
    },
    {
      icon: UsersIcon,
      title: "Target Company Analysis",
      description:
        "Input your target companies and get comprehensive analysis of their recent activities, growth patterns, and business needs.",
      color: "from-green-500 to-blue-600",
    },
    {
      icon: BoltIcon,
      title: "Natural Language Processing",
      description:
        "Advanced NLP algorithms analyze news articles, press releases, and updates to extract meaningful business insights and trends.",
      color: "from-yellow-500 to-orange-600",
    },
    {
      icon: ShieldCheckIcon,
      title: "Personalized Recommendations",
      description:
        "Get tailored suggestions on how your services can address specific needs based on real-time company developments and trends.",
      color: "from-red-500 to-red-600",
    },
    {
      icon: ArrowTrendingUpIcon,
      title: "Opportunity Scoring",
      description:
        "AI-powered scoring system ranks opportunities by relevance, timing, and potential success probability for your business.",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: EyeIcon,
      title: "Market Intelligence",
      description:
        "Stay ahead with comprehensive market insights, competitor analysis, and industry trends that impact your B2B opportunities.",
      color: "from-teal-500 to-cyan-600",
    },
  ];

  const stats = [
    { value: "85%", label: "More relevant opportunities found" },
    { value: "12hrs", label: "Saved per week on research" },
    { value: "94%", label: "Accuracy in trend analysis" },
    { value: "3.2x", label: "Faster B2B outreach success" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-900 relative overflow-hidden">
      {/* Animated Background Stars */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Layer 1: Small stars */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={`star-small-${i}`}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Layer 2: Medium stars */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={`star-medium-${i}`}
              className="absolute w-2 h-2 bg-blue-400/60 rounded-full blur-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Layer 3: Large glowing orbs */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`orb-${i}`}
              className="absolute w-3 h-3 rounded-full blur-md"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `radial-gradient(circle, ${
                  [
                    "rgba(59, 130, 246, 0.2)",
                    "rgba(37, 99, 235, 0.2)",
                    "rgba(29, 78, 216, 0.2)",
                  ][Math.floor(Math.random() * 3)]
                }, transparent)`,
              }}
              animate={{
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 2, 1],
                y: [0, -30, 0],
              }}
              transition={{
                duration: 5 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
      </div>

        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white/40" />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm"
            : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <img
                src="/inspire-logo.svg"
                alt="Inspire Logo"
                className="w-40 object-contain"
              />
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#testimonials"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Success Stories
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                How It Works
              </a>
          </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100/50"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-32 px-6 relative z-10 min-h-screen">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(/Image-GBMHW8Y.jpg)",
            opacity: 0.8,
          }}
        ></div>
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="max-w-7xl pt-32 mx-auto relative z-10 h-full flex items-center">
          <div className="text-left max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-flex items-center space-x-2  px-4 py-2 mb-6 ">
                <span className="text-md text-left text-white uppercase tracking-wider">
                  Empowering MSMEs to Build Global Businesses
                </span>
              </div>

              <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="text-white">Your Business,</span>
                <p className="text-white"> Our Mission.</p>
              </h1>

              <p className="text-xl text-left text-gray-200 mb-8 max-w-3xl  leading-relaxed">
                Transform how you discover and pursue strategic partnerships
                with AI-powered insights that turn market intelligence into
                actionable business growth.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-start items-start mb-12"
            >
              <Link
                to="/signup"
                className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Start Free Trial
              </Link>

              <button className="group flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-sm">
                <span>Learn More</span>
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold bg-white bg-clip-text text-transparent mb-2">
                    {stat.value}
              </div>
                  <div className="text-gray-200 text-sm">{stat.label}</div>
            </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 relative z-10 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <div>
              <div className="inline-block bg-gradient-to-r from-blue-500/10 to-blue-700/10 border border-blue-500/20 rounded-full px-6 py-2 mb-6">
                <span className="text-sm font-semibold text-blue-600">
                  ABOUT US
                </span>
              </div>

              <h2 className="text-5xl font-bold mb-6 text-gray-900">
                Your Business Growth Partner
              </h2>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                We're not just another AI platform. We're your strategic partner
                in growth, dedicated to empowering Rwandan MSMEs with the
                intelligence and tools needed to compete globally and build
                lasting business relationships.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Learn More About Us
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="group relative bg-gray-100/80 backdrop-blur-sm rounded-xl p-6 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105">
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url(/strategic.jpg)" }}
                  ></div>
                  {/* Dark overlay for text visibility - only on hover */}
                  <div className="absolute inset-0 bg-transparent group-hover:bg-black/70 transition-colors duration-300"></div>

                  <div className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                      <ChartBarIcon className="w-6 h-6 text-blue-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Strategic Results
                    </h3>
                    <p className="text-white text-sm font-medium">
                      Our AI-powered analytics provide comprehensive market
                      intelligence, competitor analysis, and growth
                      opportunities that translate into concrete business
                      outcomes and measurable ROI for your organization.
                    </p>
                  </div>
          </div>

                <div className="group relative bg-gray-100/80 backdrop-blur-sm rounded-xl p-6 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105">
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url(/client.jpg)" }}
                  ></div>
                  {/* Dark overlay for text visibility - only on hover */}
                  <div className="absolute inset-0 bg-transparent group-hover:bg-black/70 transition-colors duration-300"></div>

                  <div className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                      <UserGroupIcon className="w-6 h-6 text-blue-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Client-Centric Approach
                    </h3>
                    <p className="text-white text-sm font-medium">
                      We understand that every business is unique. Our platform
                      adapts to your specific industry, company size, and growth
                      objectives, ensuring every feature and insight is directly
                      relevant to your success.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mt-8">
                <div className="group relative bg-gray-100/80 backdrop-blur-sm rounded-xl p-6 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105">
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url(/purpose.jpg)" }}
                  ></div>
                  {/* Dark overlay for text visibility - only on hover */}
                  <div className="absolute inset-0 bg-transparent group-hover:bg-black/70 transition-colors duration-300"></div>

                  <div className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                      <LightBulbIcon className="w-6 h-6 text-green-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Purpose Behind Every Move
                    </h3>
                    <p className="text-white text-sm font-medium">
                      Every algorithm, every data point, and every
                      recommendation is crafted with intentionality. We don't
                      just provide data – we provide purpose-driven insights
                      that align with your business goals and drive meaningful
                      action.
                    </p>
                  </div>
                </div>

                <div className="group relative bg-gray-100/80 backdrop-blur-sm rounded-xl p-6 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105">
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url(/growth.jpg)" }}
                  ></div>
                  {/* Dark overlay for text visibility - only on hover */}
                  <div className="absolute inset-0 bg-transparent group-hover:bg-black/70 transition-colors duration-300"></div>

                  <div className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                      <RocketLaunchIcon className="w-6 h-6 text-orange-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Growth Acceleration
                    </h3>
                    <p className="text-white text-sm font-medium">
                      From identifying new market opportunities to optimizing
                      your sales pipeline, our platform accelerates every aspect
                      of your growth journey, helping you scale faster and more
                      efficiently than ever before.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-50/50 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block bg-gradient-to-r from-blue-500/10 to-blue-700/10 border border-blue-500/20 rounded-full px-6 py-2 mb-6">
              <span className="text-sm font-semibold text-blue-600">
                WHAT WE DO
              </span>
            </div>

            <h2 className="text-5xl font-bold mb-6">
              <span className="text-gray-900">
                Solutions For Business Growth
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful AI-driven tools designed specifically for MSMEs.
              Transform how you identify, analyze, and pursue strategic
              partnership opportunities to scale globally.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300/70 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
            </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
            </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Trusted by
              </span>
              <br />
              <span className="text-gray-900">B2B professionals worldwide</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how leading companies are using Inspire to discover strategic
              B2B opportunities and accelerate growth.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 md:p-12 shadow-lg">
              <div className="flex items-center justify-center mb-8">
                <div className="flex space-x-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === activeTestimonial
                          ? "bg-blue-500 scale-125"
                          : "bg-gray-400 hover:bg-gray-500"
                      }`}
                    />
                  ))}
            </div>
          </div>

              <div className="text-center max-w-4xl mx-auto">
                <div className="flex items-center justify-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                    <img
                      src={testimonials[activeTestimonial].avatar}
                      alt={testimonials[activeTestimonial].name}
                      className="w-16 h-16 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
            </div>

                <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 mb-8 leading-relaxed">
                  "{testimonials[activeTestimonial].content}"
                </blockquote>

            <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {testimonials[activeTestimonial].name}
                  </h4>
                  <p className="text-gray-600 text-lg">
                    {testimonials[activeTestimonial].role}
                  </p>
            </div>
          </div>

              {/* Star ratings */}
              <div className="flex justify-center mt-8">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="w-6 h-6 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-20 px-6 bg-gray-50/50 relative z-10"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block bg-gradient-to-r from-blue-500/10 to-blue-700/10 border border-blue-500/20 rounded-full px-6 py-2 mb-6">
              <span className="text-sm font-semibold text-blue-600">
                OUR APPROACH
              </span>
            </div>

            <h2 className="text-5xl font-bold mb-6">
              <span className="text-gray-900">
                Empowering Growth Through Strategy
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes with our simple 4-step process designed to
              help MSMEs discover strategic partnerships and scale their
              businesses globally.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                step: 1,
                title: "Describe Your Services",
                description:
                  "Tell us what your company offers - your products, services, and unique value propositions that set you apart in the market.",
                image: "/images/Humaaans/sitting-1.svg",
              },
              {
                step: 2,
                title: "Input Target Companies",
                description:
                  "Add your list of target companies you want to connect with. Our system will analyze each one for relevant opportunities.",
                image: "/images/Humaaans/standing-1.svg",
              },
              {
                step: 3,
                title: "AI Web Scraping & Analysis",
                description:
                  "Our AI scrapes news, updates, and trends about your target companies, using NLP to extract meaningful business insights.",
                image: "/images/Humaaans/sitting-2.svg",
              },
              {
                step: 4,
                title: "Get Personalized Recommendations",
                description:
                  "Receive tailored suggestions on how your services can address specific needs based on real-time company developments.",
                image: "/images/Humaaans/standing-2.svg",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row items-center gap-8"
              >
                <div className="w-48 h-48 flex-shrink-0 relative">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg">
                    {item.step}
                  </div>
                  <div className="w-full h-full bg-gray-100/80 rounded-2xl flex items-center justify-center border border-gray-200/50">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-32 h-32 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-800/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-12 md:p-16 text-center shadow-2xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Your Success Starts Here
              </h2>
              <p className="text-xl text-blue-100 mb-4 max-w-3xl mx-auto leading-relaxed font-semibold">
                Your Business, Our Mission.
              </p>
              <p className="text-lg text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
                Join Rwandan entrepreneurs using INSPIRE to discover strategic
                partnerships, analyze market opportunities, and accelerate
                growth with AI-powered business intelligence.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
                <Link
                  to="/signup"
                  className="group bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Start Free Trial
                </Link>
                
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-blue-100">
                <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                  <CheckIcon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">Strategic Results</span>
                </div>
                <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                  <CheckIcon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">Client-Centric Approach</span>
                </div>
                <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                  <CheckIcon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">Purpose Behind Every Move</span>
          </div>
        </div>
      </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200/50 bg-gray-50/50 relative z-10">
        <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <img
                src="/inspire-logo.svg"
                alt="Inspire Logo"
                className="w-40 object-contain"
              />
            </div>

            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex space-x-6 text-gray-600">
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Terms
                </a>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Security
                </a>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Contact
                </a>
              </div>
              <div className="text-gray-600 text-sm">
                © 2025 Inspire. AI-powered B2B Intelligence Platform.
              </div>
          </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
