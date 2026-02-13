import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ChefHat,
  Zap,
  Clock,
  Star,
  ArrowRight,
  Play,
  Sparkles,
  Smartphone,
  MapPin,
  Heart
} from 'lucide-react';
import * as THREE from 'three';

// Floating 3D Food Items Component
const ThreeDBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = 5;

    // Create floating food particles
    const particles = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.05 + Math.random() * 0.1, 16, 16);

      // Different colors for different "food items"
      const colors = [
        0xFF6B6B, // Red (tomato)
        0xFFD93D, // Yellow (cheese)
        0x6BCF7F, // Green (lettuce)
        0xFF8C42, // Orange (carrot)
        0xA8E6CF, // Mint
        0xFFB6C1  // Pink
      ];

      const material = new THREE.MeshPhongMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        emissive: colors[Math.floor(Math.random() * colors.length)],
        emissiveIntensity: 0.2,
        shininess: 100
      });

      const particle = new THREE.Mesh(geometry, material);

      particle.position.x = (Math.random() - 0.5) * 10;
      particle.position.y = (Math.random() - 0.5) * 10;
      particle.position.z = (Math.random() - 0.5) * 10;

      particle.userData = {
        velocity: {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01,
          z: (Math.random() - 0.5) * 0.01,
        },
        rotationSpeed: {
          x: Math.random() * 0.02,
          y: Math.random() * 0.02,
        }
      };

      particles.push(particle);
      scene.add(particle);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xFF6B6B, 1);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x6BCF7F, 1);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      particles.forEach(particle => {
        particle.position.x += particle.userData.velocity.x;
        particle.position.y += particle.userData.velocity.y;
        particle.position.z += particle.userData.velocity.z;

        particle.rotation.x += particle.userData.rotationSpeed.x;
        particle.rotation.y += particle.userData.rotationSpeed.y;

        // Boundary check
        if (Math.abs(particle.position.x) > 5) particle.userData.velocity.x *= -1;
        if (Math.abs(particle.position.y) > 5) particle.userData.velocity.y *= -1;
        if (Math.abs(particle.position.z) > 5) particle.userData.velocity.z *= -1;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 opacity-30"
    />
  );
};

// Animated Stats Component
const AnimatedStat = ({ number, label, delay }: { number: string; label: string; delay: number }) => {
  const [count, setCount] = useState(0);
  const finalNumber = parseInt(number.replace(/\D/g, ''));

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = finalNumber / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= finalNumber) {
        setCount(finalNumber);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [finalNumber]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
        {number.includes('+') ? `${count}+` : count}
      </div>
      <div className="text-gray-600 dark:text-gray-400 mt-2">{label}</div>
    </motion.div>
  );
};

// Main Landing Page
export default function LandingPage3D() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 overflow-hidden">
      {/* 3D Background */}
      <ThreeDBackground />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <motion.div
          style={{ opacity, scale }}
          className="text-center max-w-6xl mx-auto z-10"
        >
          {/* Floating Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-block mb-6"
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-full px-6 py-2 border border-orange-200 dark:border-orange-800 shadow-lg">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-orange-500 animate-pulse" />
                <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  #1 Food Delivery in Your City
                </span>
              </span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-6xl md:text-8xl font-black mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Delicious Food
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">
              Delivered Fast
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto"
          >
            Your favorite restaurants, delivered to your door in minutes.
            Fresh, hot, and ready to enjoy.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/restaurants">
              <Button
                size="lg"
                className="group relative px-8 py-6 text-lg font-semibold bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Order Now
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </Link>

            {/* <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg font-semibold border-2 border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 backdrop-blur-sm"
            >
              <Play className="h-5 w-5 mr-2" />
              Watch Demo
            </Button> */}
          </motion.div>

          {/* Floating Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
          >
            {[
              { icon: Zap, title: 'Lightning Fast', desc: '30 min delivery' },
              { icon: ChefHat, title: '500+ Restaurants', desc: 'Best food in town' },
              { icon: Star, title: '4.8 Rating', desc: '50k+ reviews' },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-orange-100 dark:border-orange-900 shadow-xl"
              >
                <feature.icon className="h-12 w-12 text-orange-500 mb-4 mx-auto" />
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 border-2 border-orange-500 rounded-full flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Three simple steps to deliciousness
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                icon: MapPin,
                title: 'Choose Location',
                desc: 'Enter your delivery address and browse nearby restaurants'
              },
              {
                step: '02',
                icon: Heart,
                title: 'Pick Your Meal',
                desc: 'Select from hundreds of delicious dishes and customize to your taste'
              },
              {
                step: '03',
                icon: Clock,
                title: 'Fast Delivery',
                desc: 'Track your order in real-time and enjoy hot, fresh food'
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="relative group"
              >
                <div className="bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 shadow-2xl border border-orange-100 dark:border-orange-900 overflow-hidden">
                  {/* Step Number Background */}
                  <div className="absolute -top-4 -right-4 text-9xl font-black text-orange-100 dark:text-orange-900/20 group-hover:text-orange-200 dark:group-hover:text-orange-800/30 transition-colors">
                    {item.step}
                  </div>

                  {/* Icon */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                      <item.icon className="h-10 w-10 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 px-4 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 relative overflow-hidden">
        {/* Animated Background Blobs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-white/90">
              Join our growing community of happy customers
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <AnimatedStat number="500+" label="Restaurants" delay={0.2} />
            <AnimatedStat number="50000+" label="Happy Customers" delay={0.4} />
            <AnimatedStat number="100000+" label="Deliveries" delay={0.6} />
            <AnimatedStat number="4.8" label="Average Rating" delay={0.8} />
          </div>
        </div>
      </section>

      {/* Download App CTA */}
      {/* Why Choose Swift Spoon */}
      <section className="py-32 px-4 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 rounded-3xl p-12 md:p-16 text-center shadow-2xl relative overflow-hidden"
        >
          {/* Animated Glow Background */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.2, 0.4],
            }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute bottom-0 left-0 w-72 h-72 bg-purple-400 rounded-full blur-3xl"
          />

          <div className="relative z-10">

            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Why Choose Swift Spoon?
            </h2>

            <p className="text-xl text-white/90 mb-16 max-w-2xl mx-auto">
              Seamless ordering, secure payments, and lightning fast delivery —
              everything designed for the perfect food experience.
            </p>

            <div className="grid md:grid-cols-3 gap-8">

              {[
                {
                  icon: Zap,
                  title: "Lightning Fast Delivery",
                  desc: "Average delivery time under 30 minutes with real-time tracking."
                },
                {
                  icon: Star,
                  title: "Top Rated Restaurants",
                  desc: "Curated restaurants with 4.5+ ratings and verified reviews."
                },
                {
                  icon: Clock,
                  title: "Secure & Easy Payments",
                  desc: "Integrated Razorpay checkout with encrypted transactions."
                }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-xl text-white"
                >
                  <item.icon className="h-12 w-12 mb-4 mx-auto text-white" />
                  <h3 className="text-2xl font-bold mb-3">
                    {item.title}
                  </h3>
                  <p className="text-white/80">
                    {item.desc}
                  </p>
                </motion.div>
              ))}

            </div>

            {/* CTA */}
            <div className="mt-16">
              <Link to="/restaurants">
                <Button
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-10 py-6 text-lg shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  Explore Restaurants
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

          </div>
        </motion.div>
      </section>
    </div>
  )};
