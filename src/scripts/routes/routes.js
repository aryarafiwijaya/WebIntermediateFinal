import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/login/login-page';
import RegisterPage from '../pages/register/register-page';
import AddStoryPage from '../pages/add-story/add-story-page';
import DetailPage from '../pages/detail/detail-page';
import SavedStoriesPage from '../pages/saved-stories/saved-stories'; 

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/add-story': new AddStoryPage(),
  '/detail/:id': new DetailPage(),
  '/saved-stories': new SavedStoriesPage(), 
};

export default routes;
