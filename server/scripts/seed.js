import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Recipe from '../src/models/Recipe.js';

const images=[
'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=1200&q=80'];
const data=[
['Masala Butter Paneer','Indian','veg',35,3,'medium',['paneer','curry','north-indian'],[['paneer',400,'g'],['tomato',300,'g'],['butter',2,'tbsp'],['cream',100,'ml']],["Blend tomatoes into a smooth puree.","Cook spices and tomato puree until glossy.","Add paneer, butter and cream; simmer for 8 minutes."]],
['Lemon Garlic Pasta','Italian','veg',25,2,'easy',['pasta','quick','garlic'],[['spaghetti',200,'g'],['garlic',5,'cloves'],['lemon',1,''],['parmesan',40,'g']],["Boil pasta until al dente.","Saute garlic gently in olive oil.","Toss pasta with lemon, parmesan and pasta water."]],
['Green Goddess Bowl','Mediterranean','vegan',20,2,'easy',['salad','healthy','greens'],[['chickpeas',200,'g'],['cucumber',1,''],['spinach',80,'g'],['tahini',2,'tbsp']],["Wash and chop the vegetables.","Whisk tahini with lemon and water.","Build the bowl and drizzle with dressing."]],
['Smoky Bean Tacos','Mexican','vegan',30,4,'easy',['tacos','beans','mexican'],[['black beans',400,'g'],['tortillas',8,''],['corn',100,'g'],['lime',1,'']],["Warm beans with cumin and smoked paprika.","Toast tortillas in a dry pan.","Fill with beans, corn, lime and fresh salsa."]],
['Creamy Mushroom Risotto','Italian','veg',45,3,'medium',['rice','mushroom','comfort'],[['arborio rice',250,'g'],['mushroom',250,'g'],['stock',800,'ml'],['parmesan',50,'g']],["Saute mushrooms and reserve them.","Toast rice and add warm stock gradually.","Finish with mushrooms, parmesan and butter."]],
['Thai Coconut Noodles','Asian','vegan',30,2,'medium',['thai','noodles','coconut'],[['rice noodles',200,'g'],['coconut milk',400,'ml'],['bell pepper',1,''],['lime',1,'']],["Soak noodles according to packet directions.","Simmer coconut milk with curry paste.","Add vegetables and noodles; finish with lime."]],
['Keto Avocado Eggs','Asian','keto',15,1,'easy',['keto','breakfast','eggs'],[['eggs',2,''],['avocado',1,''],['chilli flakes',1,'tsp'],['lime',0.5,'']],["Poach or fry the eggs to your preference.","Scoop avocado into a bowl.","Top with eggs, chilli and lime."]],
['Palak Chickpea Curry','Indian','vegan',40,4,'medium',['spinach','chickpea','curry'],[['chickpeas',400,'g'],['spinach',300,'g'],['onion',1,''],['tomato',2,'']],["Blanch spinach and blend until smooth.","Cook onion and tomato with spices.","Stir in chickpeas and spinach; simmer."]],
['Roasted Tomato Bruschetta','Italian','veg',20,4,'easy',['starter','tomato','bread'],[['bread',8,'slices'],['tomato',300,'g'],['basil',10,'g'],['olive oil',2,'tbsp']],["Dice tomatoes and season with basil.","Toast bread until crisp.","Top toast with tomatoes and olive oil."]],
['Teriyaki Chicken Bowl','Asian','non-veg',35,2,'easy',['chicken','rice','teriyaki'],[['chicken breast',300,'g'],['rice',160,'g'],['soy sauce',3,'tbsp'],['broccoli',150,'g']],["Cook rice until fluffy.","Sear chicken and glaze with teriyaki sauce.","Steam broccoli and assemble the bowl."]],
['Mango Chia Pudding','Mediterranean','vegan',10,2,'easy',['dessert','mango','breakfast'],[['chia seeds',50,'g'],['coconut milk',250,'ml'],['mango',1,''],['maple syrup',1,'tbsp']],["Mix chia seeds with coconut milk.","Refrigerate overnight.","Top with mango and maple syrup."]],
['Tandoori Cauliflower','Indian','vegan',35,3,'medium',['tandoori','cauliflower','roasted'],[['cauliflower',1,'head'],['yogurt',100,'g'],['tandoori masala',2,'tbsp'],['lemon',1,'']],["Mix cauliflower with spices and yogurt.","Marinate for 20 minutes.","Roast at high heat until charred at the edges."]],
['Greek Lentil Salad','Mediterranean','vegan',25,3,'easy',['lentils','salad','feta'],[['lentils',250,'g'],['cucumber',1,''],['tomato',2,''],['lemon',1,'']],["Cook lentils until tender and cool.","Chop cucumber and tomato.","Toss with lemon dressing and herbs."]],
['Chilli Garlic Prawns','Asian','non-veg',18,2,'easy',['prawns','seafood','garlic'],[['prawns',300,'g'],['garlic',6,'cloves'],['chilli',2,''],['butter',2,'tbsp']],["Pat prawns dry and season.","Sizzle garlic and chilli in butter.","Cook prawns quickly until just opaque."]],
['Keto Paneer Skewers','Indian','keto',30,2,'easy',['keto','paneer','grill'],[['paneer',300,'g'],['capsicum',1,''],['hung curd',100,'g'],['garam masala',1,'tsp']],["Mix paneer with yogurt and spices.","Thread paneer and capsicum onto skewers.","Grill until lightly charred."]],
['Classic Tomato Soup','Mediterranean','veg',30,4,'easy',['soup','tomato','comfort'],[['tomato',700,'g'],['onion',1,''],['garlic',3,'cloves'],['cream',50,'ml']],["Roast or saute tomatoes, onion and garlic.","Blend with warm stock until smooth.","Simmer and finish with cream."]]
];

await connectDB();
await User.deleteMany({}); await Recipe.deleteMany({});
const passwordHash=await bcrypt.hash('Password123!',12);
const users=await User.create([
{name:'Aanya Kapoor',email:'aanya@example.com',passwordHash,bio:'Vegetarian home cook.'},
{name:'Rohan Mehta',email:'rohan@example.com',passwordHash,bio:'Weeknight food lover.'},
{name:'Mira Shah',email:'mira@example.com',passwordHash,bio:'Plant-based recipes.'}
]);
const recipes=data.map((d,i)=>({authorId:users[i%users.length]._id,title:d[0],slug:d[0].toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''),coverUrl:images[i%images.length],cuisine:d[1],diet:d[2],cookTime:d[3],servings:d[4],difficulty:d[5],tags:d[6],ingredients:d[7].map(x=>({name:x[0],qty:x[1],unit:x[2]})),steps:d[8].map((text,j)=>({order:j+1,text,imageUrl:j===0?images[(i+1)%images.length]:''})),avgRating:Number((4+(i%10)/10).toFixed(1)),ratingCount:5}));
await Recipe.create(recipes);
users[0].following=[users[1]._id,users[2]._id];users[1].followers=[users[0]._id];users[2].followers=[users[0]._id];await users[0].save();await users[1].save();await users[2].save();
console.log(`Seeded ${recipes.length} recipes and ${users.length} users.`);await mongoose.disconnect();
