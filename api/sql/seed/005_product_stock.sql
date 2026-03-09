-- Seed data for product stock levels
-- Sets initial inventory for all products

UPDATE products SET stock_level = 150 WHERE product_id = 1;  -- SmartFeeder One
UPDATE products SET stock_level = 85 WHERE product_id = 2;   -- AutoClean Litter Dome
UPDATE products SET stock_level = 200 WHERE product_id = 3;  -- CatFlix Entertainment Portal
UPDATE products SET stock_level = 300 WHERE product_id = 4;  -- PawTrack Smart Collar
UPDATE products SET stock_level = 120 WHERE product_id = 5;  -- WhiskerCam Pro
UPDATE products SET stock_level = 175 WHERE product_id = 6;  -- ThermoNest Deluxe
UPDATE products SET stock_level = 65 WHERE product_id = 7;   -- ClimbCast Cat Tree (larger item, lower stock)
UPDATE products SET stock_level = 220 WHERE product_id = 8;  -- HydroFlow Smart Bowl
UPDATE products SET stock_level = 45 WHERE product_id = 9;   -- PurrFect Groomer Bot (premium item, lower stock)
UPDATE products SET stock_level = 95 WHERE product_id = 10;  -- MemoryFoam Recovery Pod
UPDATE products SET stock_level = 110 WHERE product_id = 11; -- DoorDash Smart Portal
UPDATE products SET stock_level = 250 WHERE product_id = 12; -- ZoomieTracker AI Mat
