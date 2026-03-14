using MyApp.Infrastructure.Identity;
using RestSharp;

namespace MyApp.Infrastructure.Services
{
    public interface IClientHelper
    {
        Task<T> GetAsync<T>(string url, string token = null, bool isFromJob = false);
        Task<T> PostAsync<T>(string url, object data, string token = null, bool isFromJob = false);
        Task<T> GetV2Async<T>(string url, Guid? userid = null, bool isFromJob = false);
        Task<T> PostV2Async<T>(string url, object dataObject, Guid? userid = null, bool isFromJob = false);
    }
    public class ClientHelper : IClientHelper
    {
        private readonly IUserPrincipalService _userPrincipalService;

        public ClientHelper(IUserPrincipalService userPrincipalService)
        {
            _userPrincipalService = userPrincipalService;
        }

        public async Task<T> GetAsync<T>(string url, string token = null, bool isFromJob = false)
        {
            var client = new RestClient(url);
            var request = new RestRequest(url, Method.Get);

            //Token hệ thống
            //xử lí sau
            //request.AddHeader("SystemAuthorization", "Bearer " + ServiceInfo.Token);
            request.AddHeader("SB-Device", "mobile");

            var userLogin = _userPrincipalService.GetUserLogin();
            if (userLogin != null)
            {
                request.AddHeader("SystemUserId", userLogin.Id.ToString());
            }
            if (isFromJob)
            {
                request.AddHeader("SystemJob", "1");
            }
            if (!string.IsNullOrEmpty(token))
            {
                request.AddHeader("Authorization", "Bearer " + token);
            }
            request.Timeout = TimeSpan.FromSeconds(60000); //10s timeout
            var response = await client.ExecuteAsync<T>(request);

            return response.Data;
        }

        public Task<T> GetV2Async<T>(string url, Guid? userid = null, bool isFromJob = false)
        {
            throw new NotImplementedException();
        }

        public Task<T> PostAsync<T>(string url, object data, string token = null, bool isFromJob = false)
        {
            throw new NotImplementedException();
        }

        public Task<T> PostV2Async<T>(string url, object dataObject, Guid? userid = null, bool isFromJob = false)
        {
            throw new NotImplementedException();
        }
    }
}
