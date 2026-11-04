-- =====================================================================
-- Common Ground: demo content. Run AFTER the demo auth users exist
-- (scripts/provision.mjs creates them through the Supabase Admin API).
-- Only seeds when there are no issues yet, so it's safe to re-run.
-- =====================================================================
do $$
declare
  jane uuid;  john uuid;  priya uuid; marcus uuid;
  sofia uuid; ben uuid;   aisha uuid; tom uuid;
  i_potluck bigint; i_cleanup bigint; i_garden bigint; i_coats bigint; i_swing bigint;
  t bigint;
  d text := 'YYYY-MM-DD';
begin
  if exists (select 1 from public.issues) then
    raise notice 'Issues already exist, skipping seed.';
    return;
  end if;

  select id into jane   from public.profiles where email = 'jane@example.com';
  select id into john   from public.profiles where email = 'john@example.com';
  select id into priya  from public.profiles where email = 'priya@example.com';
  select id into marcus from public.profiles where email = 'marcus@example.com';
  select id into sofia  from public.profiles where email = 'sofia@example.com';
  select id into ben    from public.profiles where email = 'ben@example.com';
  select id into aisha  from public.profiles where email = 'aisha@example.com';
  select id into tom    from public.profiles where email = 'tom@example.com';

  if jane is null then
    raise exception 'Demo members are missing; create them first.';
  end if;

  -- Profile details (bios, phones, colors, join dates)
  update public.profiles set phone = '(555) 010-4410', color = '#2f6f5e', created_at = now() - interval '90 days',
    bio = 'Potluck organizer and sourdough enthusiast. Happy to host planning nights at my place on Elm St.' where id = jane;
  update public.profiles set phone = '(555) 010-7782', color = '#e07a4f', created_at = now() - interval '81 days',
    bio = 'Elm St. grill master. If it involves charcoal, count me in.' where id = john;
  update public.profiles set phone = '(555) 010-3321', color = '#5162c4', created_at = now() - interval '72 days',
    bio = 'I run the Oak St. community garden. Always looking for extra hands on Saturday mornings.' where id = priya;
  update public.profiles set phone = '(555) 010-9054', color = '#c2577a', created_at = now() - interval '63 days',
    bio = 'Handyman with a pickup truck. Ask me before you buy a tool, because I probably have one.' where id = marcus;
  update public.profiles set phone = '(555) 010-2267', color = '#c98a1b', created_at = now() - interval '54 days',
    bio = 'Baker, book club host, and mom of two.' where id = sofia;
  update public.profiles set phone = '', color = '#3a8fb7', created_at = now() - interval '45 days',
    bio = 'New to the neighborhood. Say hi!' where id = ben;
  update public.profiles set phone = '(555) 010-6619', color = '#7a5bc9', created_at = now() - interval '36 days',
    bio = 'Library volunteer and coat drive coordinator.' where id = aisha;
  update public.profiles set phone = '(555) 010-1188', color = '#4f8a3c', created_at = now() - interval '27 days',
    bio = 'Retired carpenter. I fix swings, fences and the occasional bike.' where id = tom;

  -- 1. Potluck
  insert into public.issues (owner_id, title, location, starts_at, is_open, created_at, updated_at, description)
  values (jane, 'Fall Community Potluck', 'Maple Park Pavilion',
          to_char(now() + interval '10 days', d) || 'T17:00', true, now() - interval '72 hours', now() - interval '72 hours',
          E'Our fall potluck is back! Bring a dish to share, a chair if you have one, and your appetite.\n\nAdd a task below to tell everyone what you’re bringing so we don’t end up with six bowls of potato salad.')
  returning id into i_potluck;

  insert into public.tasks (issue_id, owner_id, title, created_at, updated_at)
  values (i_potluck, john, 'I’ll bring the chips', now() - interval '70 hours', now() - interval '70 hours') returning id into t;
  insert into public.comments (task_id, author_id, body, created_at, updated_at) values
    (t, jane, 'Could you grab some salsa too?', now() - interval '68 hours', now() - interval '68 hours'),
    (t, john, 'You got it, mild and hot.',      now() - interval '67 hours', now() - interval '67 hours');
  insert into public.tasks (issue_id, owner_id, title, created_at, updated_at)
  values (i_potluck, jane, 'I’ll bring the sodas', now() - interval '69 hours', now() - interval '69 hours');
  insert into public.tasks (issue_id, owner_id, title, created_at, updated_at)
  values (i_potluck, priya, 'Veggie lasagna, one big tray', now() - interval '50 hours', now() - interval '50 hours') returning id into t;
  insert into public.comments (task_id, author_id, body, created_at, updated_at) values
    (t, sofia, 'Yum! Is it vegetarian or vegan?',  now() - interval '40 hours', now() - interval '40 hours'),
    (t, priya, 'Vegetarian, with lots of cheese.', now() - interval '39 hours', now() - interval '39 hours');
  insert into public.tasks (issue_id, owner_id, title, created_at, updated_at)
  values (i_potluck, sofia, 'Apple crumble for dessert', now() - interval '30 hours', now() - interval '30 hours');
  insert into public.tasks (issue_id, owner_id, title, created_at, updated_at)
  values (i_potluck, marcus, 'Setting up tables and chairs at 4pm', now() - interval '20 hours', now() - interval '20 hours') returning id into t;
  insert into public.comments (task_id, author_id, body, created_at, updated_at) values
    (t, tom, 'I can help carry. Meet you there at 4.', now() - interval '10 hours', now() - interval '10 hours');
  insert into public.tasks (issue_id, owner_id, title, created_at, updated_at)
  values (i_potluck, ben, 'Paper plates, cups and napkins', now() - interval '5 hours', now() - interval '5 hours');

  -- 2. Park cleanup
  insert into public.issues (owner_id, title, location, starts_at, is_open, created_at, updated_at, description)
  values (marcus, 'Saturday Park Cleanup', 'Riverside Park, north entrance',
          to_char(now() + interval '4 days', d) || 'T09:00', true, now() - interval '120 hours', now() - interval '120 hours',
          'Let’s get Riverside Park looking great before winter. We’ll meet at the north entrance and split into teams. Kids welcome!')
  returning id into i_cleanup;

  insert into public.tasks (issue_id, owner_id, title, created_at, updated_at)
  values (i_cleanup, marcus, 'Bringing my truck to haul bags to the dump', now() - interval '118 hours', now() - interval '118 hours');
  insert into public.tasks (issue_id, owner_id, title, created_at, updated_at)
  values (i_cleanup, ben, 'Two boxes of heavy-duty trash bags', now() - interval '100 hours', now() - interval '100 hours');
  insert into public.tasks (issue_id, owner_id, title, created_at, updated_at)
  values (i_cleanup, aisha, 'Work gloves in kid sizes', now() - interval '80 hours', now() - interval '80 hours') returning id into t;
  insert into public.comments (task_id, author_id, body, created_at, updated_at) values
    (t, ben, 'My two are coming. Thank you!', now() - interval '60 hours', now() - interval '60 hours');
  insert into public.tasks (issue_id, owner_id, title, created_at, updated_at)
  values (i_cleanup, john, 'Coffee and donuts for volunteers', now() - interval '48 hours', now() - interval '48 hours') returning id into t;
  insert into public.comments (task_id, author_id, body, created_at, updated_at) values
    (t, marcus, 'Legend.', now() - interval '47 hours', now() - interval '47 hours');

  -- 3. Garden (project, no date)
  insert into public.issues (owner_id, title, location, starts_at, is_open, created_at, updated_at, description)
  values (priya, 'Community Garden: Winter Prep', 'Oak St. Community Garden', null, true,
          now() - interval '300 hours', now() - interval '300 hours',
          'Putting the garden to bed for the winter. Pick a job below and finish it any time before the first hard frost.')
  returning id into i_garden;

  insert into public.tasks (issue_id, owner_id, title, done, created_at, updated_at)
  values (i_garden, priya, 'Order 10 bags of mulch', true, now() - interval '290 hours', now() - interval '290 hours');
  insert into public.tasks (issue_id, owner_id, title, created_at, updated_at)
  values (i_garden, tom, 'Build cold frames for beds 2 and 5', now() - interval '200 hours', now() - interval '200 hours') returning id into t;
  insert into public.comments (task_id, author_id, body, created_at, updated_at) values
    (t, priya, 'Do you need anything from the hardware store?', now() - interval '180 hours', now() - interval '180 hours'),
    (t, tom,   'Just hinges. I’ve got the lumber.',             now() - interval '170 hours', now() - interval '170 hours');
  insert into public.tasks (issue_id, owner_id, title, done, created_at, updated_at)
  values (i_garden, sofia, 'Plant garlic in bed #3', true, now() - interval '150 hours', now() - interval '150 hours');
  insert into public.tasks (issue_id, owner_id, title, created_at, updated_at)
  values (i_garden, aisha, 'Drain and store the hoses', now() - interval '40 hours', now() - interval '40 hours');

  -- 4. Coat drive
  insert into public.issues (owner_id, title, location, starts_at, is_open, created_at, updated_at, description)
  values (aisha, 'Winter Coat Drive', 'Lincoln Library lobby', to_char(now() + interval '21 days', d), true,
          now() - interval '200 hours', now() - interval '200 hours',
          'Collecting gently used coats, hats and gloves for families who need them this winter. The drop-off bin is in the library lobby through the end of the month.')
  returning id into i_coats;

  insert into public.tasks (issue_id, owner_id, title, created_at, updated_at)
  values (i_coats, ben, 'Donating three kids’ coats', now() - interval '150 hours', now() - interval '150 hours');
  insert into public.tasks (issue_id, owner_id, title, created_at, updated_at)
  values (i_coats, jane, 'I can pick up donations on Tuesday evenings', now() - interval '100 hours', now() - interval '100 hours') returning id into t;
  insert into public.comments (task_id, author_id, body, created_at, updated_at) values
    (t, aisha, 'Amazing, I’ll send you the addresses.', now() - interval '90 hours', now() - interval '90 hours');
  insert into public.tasks (issue_id, owner_id, title, created_at, updated_at)
  values (i_coats, sofia, 'Will wash and sort everything before delivery', now() - interval '20 hours', now() - interval '20 hours');

  -- 5. A closed project
  insert into public.issues (owner_id, title, location, starts_at, is_open, created_at, updated_at, description)
  values (tom, 'Fix the Playground Swing', 'Maple Park playground', null, false,
          now() - interval '700 hours', now() - interval '700 hours',
          'The left swing at Maple Park has a rusted chain and a cracked seat. Let’s fix it before someone gets hurt.')
  returning id into i_swing;

  insert into public.tasks (issue_id, owner_id, title, done, created_at, updated_at)
  values (i_swing, marcus, 'Replace the chain and S-hooks', true, now() - interval '690 hours', now() - interval '690 hours');
  insert into public.tasks (issue_id, owner_id, title, done, created_at, updated_at)
  values (i_swing, tom, 'Install the new seat and repaint the frame', true, now() - interval '680 hours', now() - interval '680 hours') returning id into t;
  insert into public.comments (task_id, author_id, body, created_at, updated_at) values
    (t, ben, 'Kids are thrilled. Thank you both!', now() - interval '600 hours', now() - interval '600 hours');
end $$;
