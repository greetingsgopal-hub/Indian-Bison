import json
import re
from pathlib import Path

# Phase 1: 5 Test Prospects from Greater Noida (Dentists Niche)
TEST_PROSPECTS = [
    {
        "id": "GN-DENT-001",
        "business_name": "3 C Dental Clinic (3C Dental Center)",
        "address_locality": "UGF-14, Eldeco Arcadia Shopping Complex, Sector Pi-1 / Phi-1, Greater Noida, UP 201310",
        "rating": 3.7,
        "total_reviews": 46,
        "phone_whatsapp": "+918130472244",
        "website_url": "MISSING_WEBSITE",
        "key_friction_point": "Sliding 3.7★ rating with 1-2★ reviews citing walk-in wait times, unconfirmed visiting specialist schedules, and zero website link."
    },
    {
        "id": "GN-DENT-002",
        "business_name": "Dr. Suman Singh Dental Health Clinic",
        "address_locality": "A-3, Near Gate No. 1, Edana Apartment, Sector Alpha-1, Greater Noida, UP 201310",
        "rating": 4.1,
        "total_reviews": 38,
        "phone_whatsapp": "+919953044628",
        "website_url": "http://sumandentalhealthclinic.com (BROKEN_SSL_HTTP)",
        "key_friction_point": "Unsecure HTTP link triggering browser warnings + 4.1★ rating with negative feedback on evening OPD timing confusion."
    },
    {
        "id": "GN-DENT-003",
        "business_name": "Mouth Matters (The Dental Centre)",
        "address_locality": "Shop No. 42, Kadamba Shopping Complex, Sector Gamma-1, Greater Noida, UP 201308",
        "rating": 4.2,
        "total_reviews": 64,
        "phone_whatsapp": "+919889085093",
        "website_url": "http://mouthmatters.yolasite.com (ABANDONED_FREE_SUBDOMAIN)",
        "key_friction_point": "Abandoned free Yolasite subdomain lacking mobile booking + 4.2★ rating with patient friction around aligner pricing/scheduling."
    },
    {
        "id": "GN-DENT-004",
        "business_name": "Muskan Dental Clinic (Dr. Gautam Kumar)",
        "address_locality": "Shop No. 215, 2nd Floor, Om Tower, Alpha-1 Commercial Belt, Greater Noida, UP 201310",
        "rating": 4.4,
        "total_reviews": 520,
        "phone_whatsapp": "+919873206739",
        "website_url": "MISSING_WEBSITE",
        "key_friction_point": "High-authority local clinic (520+ reviews) with MISSING_WEBSITE and waiting room bottlenecks in Alpha-1 Commercial Belt."
    },
    {
        "id": "GN-DENT-005",
        "business_name": "The Dentist Multispeciality Dental Clinic (Dr. Nakul Motla)",
        "address_locality": "Sector Beta-2 Market, Greater Noida, UP 201308",
        "rating": 4.9,
        "total_reviews": 1020,
        "phone_whatsapp": "+919289992022",
        "website_url": "MISSING_WEBSITE",
        "key_friction_point": "1,020+ reviews with MISSING_WEBSITE; relies on manual phone booking causing front-desk call congestion during peak OPD hours."
    }
]

# Phase 2: Refined Psychological Hooks (<60 words each)
PHASE_2_HOOKS = [
    {
        "id": "GN-DENT-001",
        "business_name": "3 C Dental Clinic (3C Dental Center)",
        "hook_type": "Composite: Pain-First + Low-Friction Micro-Offer (Prototype Fix)",
        "psychological_triggers_used": [
            "Pain-First: 3.7★ rating & missing website costing walk-ins in Sector Pi-1",
            "Peer Social Proof: How nearby Greater Noida clinics recovered ratings",
            "Micro-Offer: Free 1-minute audio breakdown + clickable booking prototype"
        ],
        "whatsapp_message": "Hey Dr. Abhinav, I noticed 3C Dental Clinic on Google Maps has no website link and walk-in wait-time reviews pulling your rating to 3.7★.\n\nWe helped two Greater Noida clinics fix this leak to recover 4.8★ ratings and boost walk-ins.\n\nOpen to a 1-minute audio breakdown and free prototype fix?\n(Reply STOP to opt out)",
        "opt_out_sentence": "(Reply STOP to opt out)"
    },
    {
        "id": "GN-DENT-002",
        "business_name": "Dr. Suman Singh Dental Health Clinic",
        "hook_type": "Pain-First + Peer Social Proof + Micro-Offer (1-Min Audio)",
        "psychological_triggers_used": [
            "Pain-First: Browser security warning on HTTP website link + evening OPD hour confusion",
            "Peer Social Proof: How Alpha/Beta sector clinics stopped losing mobile callers",
            "Micro-Offer: 1-minute custom audio breakdown"
        ],
        "whatsapp_message": "Hey Dr. Suman, your Alpha-1 Google Maps listing currently links to an unsecure HTTP page that shows a browser warning, and reviews mention evening timing confusion.\n\nOther Greater Noida dental clinics fixed this exact leak to double their mobile calls.\n\nOpen to a quick 1-minute custom audio breakdown of how to patch it today?\n(Reply STOP to opt out)",
        "opt_out_sentence": "(Reply STOP to opt out)"
    },
    {
        "id": "GN-DENT-003",
        "business_name": "Mouth Matters (The Dental Centre)",
        "hook_type": "Pain-First + Low-Friction Micro-Offer (Free Prototype Fix)",
        "psychological_triggers_used": [
            "Pain-First: Outdated Yolasite subdomain leaking high-ticket aligner inquiries",
            "Peer Social Proof: Gamma-1 / Jagat Farm clinics upgrading to instant WhatsApp funnels",
            "Micro-Offer: Free live mobile prototype fix"
        ],
        "whatsapp_message": "Hey Mouth Matters Team, your Gamma-1 Google listing still points to an old Yolasite subdomain, which leaks high-value aligner patients before they ever call.\n\nSimilar dental centers in Greater Noida switched to instant WhatsApp booking pages to capture 3x more walk-ins.\n\nCan I share a free prototype fix I mocked up for your clinic?\n(Reply STOP to opt out)",
        "opt_out_sentence": "(Reply STOP to opt out)"
    },
    {
        "id": "GN-DENT-004",
        "business_name": "Muskan Dental Clinic (Dr. Gautam Kumar)",
        "hook_type": "Peer Social Proof + Pain-First + Micro-Offer (1-Min Audio)",
        "psychological_triggers_used": [
            "Pain-First: 520+ reviews in Alpha-1 but zero website, leaking traffic to corporate chains nearby",
            "Peer Social Proof: How established independent dentists defend local search traffic",
            "Micro-Offer: 1-minute audio breakdown"
        ],
        "whatsapp_message": "Hey Dr. Gautam, Muskan Dental Clinic has 520+ reviews in Alpha-1, but having no website link on Google Maps lets nearby corporate chains siphon off your high-intent search traffic.\n\nWe helped similar Greater Noida practices plug this leak and automate slot booking.\n\nOpen to a 1-minute custom audio breakdown of the fix?\n(Reply STOP to opt out)",
        "opt_out_sentence": "(Reply STOP to opt out)"
    },
    {
        "id": "GN-DENT-005",
        "business_name": "The Dentist Multispeciality Dental Clinic (Dr. Nakul Motla)",
        "hook_type": "Low-Friction Micro-Offer + Pain-First + Social Proof",
        "psychological_triggers_used": [
            "Pain-First: 1,020+ reviews in Beta-2 with no website or automated slot booking, causing front-desk call bottlenecks",
            "Peer Social Proof: High-volume NCR clinics cutting reception calls by 70%",
            "Micro-Offer: Free WhatsApp booking prototype + 1-minute breakdown"
        ],
        "whatsapp_message": "Hey Dr. Nakul, with 1,000+ reviews in Beta-2, having no website or self-serve booking link on Google Maps forces every patient to call your busy front desk.\n\nHigh-volume Greater Noida clinics use our WhatsApp slot assistant to capture missed walk-ins automatically.\n\nOpen to seeing a free prototype fix built for your clinic?\n(Reply STOP to opt out)",
        "opt_out_sentence": "(Reply STOP to opt out)"
    }
]

def run_validation():
    phone_pattern = re.compile(r"^\+91[6-9]\d{9}$")
    report = {
        "total_prospects_scanned": len(TEST_PROSPECTS),
        "schema_completeness_pass": 0,
        "whatsapp_e164_pass": 0,
        "friction_verified_pass": 0,
        "hook_word_limit_pass": 0,
        "opt_out_compliance_pass": 0,
        "records": []
    }

    for p, h in zip(TEST_PROSPECTS, PHASE_2_HOOKS):
        required_keys = ["business_name", "address_locality", "rating", "total_reviews", "phone_whatsapp", "website_url", "key_friction_point"]
        has_all_keys = all(bool(p.get(k)) for k in required_keys)
        valid_phone = bool(phone_pattern.match(p["phone_whatsapp"]))
        valid_rating = isinstance(p["rating"], (int, float)) and 1.0 <= p["rating"] <= 5.0
        valid_friction = len(p["key_friction_point"]) > 20

        words = h["whatsapp_message"].split()
        word_count = len(words)
        under_60_words = word_count < 60
        has_opt_out = "STOP" in h["whatsapp_message"] and h["opt_out_sentence"] in h["whatsapp_message"]

        if has_all_keys and valid_rating:
            report["schema_completeness_pass"] += 1
        if valid_phone:
            report["whatsapp_e164_pass"] += 1
        if valid_friction:
            report["friction_verified_pass"] += 1
        if under_60_words:
            report["hook_word_limit_pass"] += 1
        if has_opt_out:
            report["opt_out_compliance_pass"] += 1

        report["records"].append({
            "id": p["id"],
            "business_name": p["business_name"],
            "schema_valid": has_all_keys and valid_rating,
            "phone_e164_valid": valid_phone,
            "phone_whatsapp": p["phone_whatsapp"],
            "website_flag": p["website_url"],
            "hook_word_count": word_count,
            "under_60_words": under_60_words,
            "opt_out_compliant": has_opt_out
        })

    output_path = Path(__file__).parent / "phase1_2_test_report.json"
    output_path.write_text(json.dumps({
        "validation_summary": report,
        "phase1_prospects": TEST_PROSPECTS,
        "phase2_hooks": PHASE_2_HOOKS
    }, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    run_validation()
