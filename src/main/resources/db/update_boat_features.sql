-- SQL script to update boat features in the database
-- To be executed on the boat safari database
-- Date: October 1, 2025

-- Update Sea Explorer features
UPDATE boat
SET features = 'GPS Navigation,Bluetooth Sound System,Life Jackets,Sun Canopy,Binoculars,Soft Drinks,Snorkeling Equipment'
WHERE boat_name = 'Sea Explorer' OR boat_name LIKE '%Sea Explorer%';

-- Update Ocean Voyager features
UPDATE boat
SET features = 'Underwater Lights,Premium Sound System,Fish Finder,Refrigerator,Complimentary Beverages,Marine Binoculars,Ice Cooler'
WHERE boat_name = 'Ocean Voyager' OR boat_name LIKE '%Ocean Voyager%';

-- Update Coral Diver features
UPDATE boat
SET features = 'Diving Platform,Snorkeling Gear,Underwater Camera,Fresh Water Shower,Reef Guidebook,Refreshments,Sun Lotion'
WHERE boat_name = 'Coral Diver' OR boat_name LIKE '%Coral Diver%';

-- Update Safari 270 features
UPDATE boat
SET features = 'Luxury Seating,Underwater Lights,Premium Sound System,Refrigerator,Freshwater Shower,Fish Finder,Marine Radio'
WHERE boat_name = 'Safari 270' OR boat_name LIKE '%Safari 270%';

-- Update Explorer 220 features
UPDATE boat
SET features = 'Fishing Rod Holders,Live Bait Well,Fish Finder,Extended Swim Platform,Fish Identification Guide,Soft Drinks,Lunch Packs'
WHERE model LIKE '%Explorer 220%' OR boat_name LIKE '%Explorer 220%';

-- Update Lagoon 300 features
UPDATE boat
SET features = 'Cabin with Bed,Marine Toilet,Kitchenette,Premium Audio System,Complimentary Wine,Binoculars,Ocean Field Guide'
WHERE model LIKE '%Lagoon 300%' OR boat_name LIKE '%Lagoon 300%';

-- Update Sunchaser 180 features
UPDATE boat
SET features = 'Swim Ladder,Cup Holders,USB Charging Ports,Anchor System,Soft Drinks,Sunscreen,Waterproof Bluetooth Speaker'
WHERE model LIKE '%Sunchaser 180%' OR boat_name LIKE '%Sunchaser 180%';

-- Update River Runner features
UPDATE boat
SET features = 'Depth Finder,Trolling Motor,Live Well,Rod Storage,River Maps,Bottled Water,Energy Drinks,Fishing Guidebook'
WHERE model LIKE '%River Runner%' OR boat_name LIKE '%River Runner%';

-- Update any boats without features (fallback)
UPDATE boat
SET features = 'Life Jackets,Navigation Lights,First Aid Kit,Safety Equipment,Binoculars,Bottled Water,Snacks'
WHERE features IS NULL OR features = '';
