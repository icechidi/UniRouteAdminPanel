/*add a sample route_times view or calculated arrival_time logic so your 
main route page can automatically show stop times for each departure. 
That way your front-end can display schedules without manual calculation.

Let’s add a calculated schedule view that combines route_times with route_stops and 
calculates arrival times based on estimated_duration. 
This will let your main route page query a single view to get all stop times for each departure.*/

-- Drop view if it exists to avoid conflicts
DROP VIEW IF EXISTS route_schedule;

-- Create a view that calculates arrival times for each stop on each route departure
CREATE VIEW route_schedule AS
SELECT
    rt.route_time_id,
    r.route_name,
    rs.stop_order,
    rs.stop_name,
    (rt.departure_time + (rs.estimated_duration * INTERVAL '1 minute')) AS arrival_time,
    rt.departure_time AS route_departure_time,
    rt.is_active
FROM route_times rt
JOIN routes r ON rt.route_id = r.route_id
JOIN route_stops rs ON r.route_id = rs.route_id
WHERE rt.is_active = TRUE
ORDER BY r.route_name, rt.departure_time, rs.stop_order;


SELECT * FROM route_schedule WHERE route_name = 'North Campus Loop';

/* If you want, I can also create a query that returns the next upcoming departure for each route with all its stops, 
so your front-end can always show “next bus schedule” automatically. 
This is handy for real-time apps.
Perfect! Let’s create a query (or view) that shows the next upcoming departure for each route along with all its stops. 
This will be super handy for your front-end to always show the “next bus schedule.”*/

-- Drop view if it exists to avoid conflicts
DROP VIEW IF EXISTS next_route_schedule;

-- Create a view for the next upcoming departure for each route
CREATE VIEW next_route_schedule AS
WITH next_departures AS (
    SELECT
        rt.route_time_id,
        rt.route_id,
        rt.departure_time,
        ROW_NUMBER() OVER (PARTITION BY rt.route_id ORDER BY rt.departure_time) AS rn
    FROM route_times rt
    WHERE rt.is_active = TRUE
      AND rt.departure_time >= CURRENT_TIME
)
SELECT
    r.route_name,
    rs.stop_order,
    rs.stop_name,
    (nd.departure_time + (rs.estimated_duration * INTERVAL '1 minute')) AS arrival_time,
    nd.departure_time AS route_departure_time
FROM next_departures nd
JOIN routes r ON nd.route_id = r.route_id
JOIN route_stops rs ON r.route_id = rs.route_id
WHERE nd.rn = 1
ORDER BY r.route_name, rs.stop_order;


SELECT * FROM next_route_schedule;


/*Perfect! Let’s create a query to display the full schedule for each route, including every stop and every departure time. 
This will combine your route_times and route_stops, showing arrival times at each stop based on estimated_duration.*/

-- Full schedule per route with arrival times
SELECT
    r.route_name,
    rt.departure_time AS route_departure_time,
    rs.stop_order,
    rs.stop_name,
    (rt.departure_time + (rs.estimated_duration * INTERVAL '1 minute')) AS arrival_time
FROM routes r
JOIN route_times rt ON r.route_id = rt.route_id
JOIN route_stops rs ON r.route_id = rs.route_id
WHERE rt.is_active = TRUE
ORDER BY r.route_name, rt.departure_time, rs.stop_order;


/*If you want, I can also create a view called full_route_schedule so you can query it like a table anytime 
instead of running the query repeatedly.*/
-- Create a view for the full route schedule
CREATE OR REPLACE VIEW full_route_schedule AS
SELECT
    r.route_id,
    r.route_name,
    rt.route_time_id,
    rt.departure_time AS route_departure_time,
    rs.route_stop_id,
    rs.stop_order,
    rs.stop_name,
    (rt.departure_time + (rs.estimated_duration * INTERVAL '1 minute')) AS arrival_time
FROM routes r
JOIN route_times rt ON r.route_id = rt.route_id
JOIN route_stops rs ON r.route_id = rs.route_id
WHERE rt.is_active = TRUE
ORDER BY r.route_name, rt.departure_time, rs.stop_order;


SELECT * FROM full_route_schedule
WHERE route_name = 'North Campus Loop';
