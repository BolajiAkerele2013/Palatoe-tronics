/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            "utfs.io",
            "7pgychdvyh.ufs.sh"
        ]
    }
}

module.exports = {
    experimental: {
      missingSuspenseWithCSRBailout: false,
    },
  }

module.exports = nextConfig
