using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Google.Cloud.Firestore;

namespace api.Models
{
    [FirestoreData]
    public class Menu
    {
        [FirestoreProperty]
        public int ItemId { get; set; }

        [FirestoreProperty]
        public string ItemName { get; set; } = string.Empty;

        [FirestoreProperty]
        public double Price { get; set; }

        [FirestoreProperty]
        public string ImageURL { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Category { get; set; } = string.Empty;

        [FirestoreProperty]
        public int Stock { get; set; }

        [FirestoreProperty]
        public DateTime CreatedAt { get; set; }
    }
}