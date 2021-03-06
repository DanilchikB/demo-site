using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using MvcUser.Models;
using MvcDataContext.Data;
using Microsoft.EntityFrameworkCore;
using Helpers.User.PasswordHasher;
using System.Collections.Generic;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;

namespace MvcUser.Controllers
{
    public class UserController : Controller
    {
        private readonly DataContext _context;

        public UserController(DataContext context)
        {
            _context = context;
        }
        // GET: /User/
        //[Authorize]
        public async Task<IActionResult> Index(int? id)
        {
            if(User.Identity.IsAuthenticated){
                User user;
                if(id == null || id == Int32.Parse(User.Identity.Name)){
                    user = await _context.User
                    //.Include(u=>u.Posts)
                    .FirstOrDefaultAsync(u => u.Id == Int32.Parse(User.Identity.Name));
                }else{
                    user = await _context.User.FirstOrDefaultAsync(u => u.Id == id);   
                }
                return View(user);
            }else{
                return RedirectToAction("Login","User");
            }
        }

        
        // GET: /User/Login/ 

        public IActionResult Login()
        {
            if(User.Identity.IsAuthenticated){
                return RedirectToAction("Index","User");
            }else{
                return View();
            }

        }
        // POST: /User/Login/
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(User user)
        {
            if (ModelState["Email"].Errors.Count == 0 && ModelState["Password"].Errors.Count == 0){
                User login = await _context.User.FirstOrDefaultAsync(b => b.Email == user.Email);
                if(login != null){
                    //Check password
                    PasswordHasher ph = new PasswordHasher();
                    bool check = ph.Check(login.Password, user.Password);
                    
                    if(check){
                        string userId = login.Id.ToString();
                        await Authenticate(userId);
                        return RedirectToAction("Index","User");
                    }else{
                        ViewBag.Error = "Wrong email or password";
                    }
                }else{
                    ViewBag.Error = "Wrong email or password";
                }
            }
            return View(user);
        }
        // GET: /User/Logout/
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction("Login", "User");
        }

        // GET: /User/Registration/

        public IActionResult Registration()
        {
            if(User.Identity.IsAuthenticated){
                return RedirectToAction("Index","User");
            }else{
                return View();
            }
        }
        // POST: /User/Registration/
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Registration(User user)
        {
            if (ModelState.IsValid)
            {
                User login = await _context.User.FirstOrDefaultAsync(b => b.Username == user.Username);
                User email = await _context.User.FirstOrDefaultAsync(b => b.Email == user.Email);
                if(login != null){
                    ModelState.AddModelError("Username", "A user with this username exists");
                }
                else if(email != null){
                    ModelState.AddModelError("Email", "A user with this email exists");
                }
                else{ 
                PasswordHasher ph = new PasswordHasher();
                user.Password = ph.Hash(user.Password);
                _context.Add(user);
                await _context.SaveChangesAsync();
                return RedirectToAction("Login", "User");
                }
            }
            return View(user);
        }
        

        //helper method for authorization using cookies
        private async Task Authenticate(string userId)
        {
            
            var claims = new List<Claim>
            {
                new Claim(ClaimsIdentity.DefaultNameClaimType, userId)
            };
            
            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            
            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, 
    new ClaimsPrincipal(claimsIdentity));
        }
    }
}