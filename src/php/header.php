<?php
// --- 1. BACKEND CONFIGURATION ---
error_reporting(E_ALL);
ini_set('display_errors', 0); 
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../errors_logs.txt');

$host = 'sdb-c.hosting.stackcp.net';
$db   = 'gonaraza-313731475d'; 
$user = 'gonaraza-313731475d';
$pass = 'Web2025@NarazaRW';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

// Initialize arrays
$categories = [];
$subcats_by_cat_id = [];
$ads_by_subcat_id = [];
$all_subcats_flat = []; 
$phone_quick_links = []; // Array for the mobile top 4

try {
    $pdo = new PDO($dsn, $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // A. Fetch All Categories
    $stmt = $pdo->query("SELECT * FROM categories ORDER BY cat_name ASC");
    $categories = $stmt->fetchAll();

    // B. Fetch All Subcategories and Group by Category ID
    $stmt = $pdo->query("SELECT * FROM sub_categories ORDER BY sub_cat_name ASC");
    $raw_subcats = $stmt->fetchAll();
    
    foreach($raw_subcats as $sub) {
        $subcats_by_cat_id[$sub['category_id']][] = $sub;
        $all_subcats_flat[] = $sub;
    }

    // C. Fetch Latest Ads with their Thumbnails
    $sql = "SELECT a.ad_id, a.ad_uuid, a.title, a.subcategory_id, a.description, am.file_path as file_name 
            FROM advertisements a
            LEFT JOIN advertisement_media am ON a.ad_id = am.ad_id AND am.is_thumbnail = 1
            WHERE a.status = 'published' 
            ORDER BY a.created_at DESC LIMIT 200";
    $stmt = $pdo->query($sql);
    $all_ads = $stmt->fetchAll();

    foreach($all_ads as $ad) {
        if(!empty($ad['subcategory_id'])) {
            $ads_by_subcat_id[$ad['subcategory_id']][] = $ad;
        }
    }

    // D. Fetch Top 4 Subcategories by Ad Count (For Mobile Quick Links)
    $top_sql = "SELECT s.subcategory_id, s.sub_cat_name, COUNT(a.ad_id) as ad_count
                FROM sub_categories s
                JOIN advertisements a ON s.subcategory_id = a.subcategory_id
                WHERE a.status = 'published'
                GROUP BY s.subcategory_id
                ORDER BY ad_count DESC
                LIMIT 4";
    $stmt = $pdo->query($top_sql);
    $phone_quick_links = $stmt->fetchAll();

} catch (PDOException $e) {
    error_log("DB Error: " . $e->getMessage());
}
?>

<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" href="../css/header.css">
    <title>Digital Advertising (Business Ads,Business News,Jobseekers&Job Donors,Business Magazines,Academia)</title>
    <style>
        /* Logic for Desktop Toggles */
        .desktop-subcat-container { display: none; }
        .desktop-ads-container { display: none; }
        
        /* Highlight states */
        .desktop-cat-trigger.active { background-color: #f1f1f1; font-weight: bold; }
        
        /* Interactive cursors */
        .mega-menu-body-item-sub { cursor: pointer; transition: background 0.2s; } 
        .mega-menu-body-item-sub:hover { background-color: #f9f9f9; }
        .mega-menu-body-item-sub.active { background-color: #eef; border: 1px solid #dde; border-radius: 4px;}

        /* Mobile Quick Links Styling Updates */
        .phone-categories-list a { text-decoration: none; color: inherit; display: inline-block; }

        /* FORCE MOBILE NAV VISIBILITY ON SMALL SCREENS */
        @media screen and (max-width: 768px) {
            .phone-categories, 
            .categories-dropup-container {
                display: flex !important;
                visibility: visible !important;
            }
        }
        /* Ensure the text container inside the mobile list takes up the remaining space */
.cdb2-item-l {
    flex: 1; /* Takes full width of the parent */
    width: 100%;
    min-width: 0; /* Prevents flexbox overflow */
}

.cdb2-item-l span {
    flex: 1;
    white-space: normal; /* Allows text to wrap to the next line if it's long */
    line-height: 1.3;
    padding-right: 10px; /* Gives some breathing room before the arrow */
}
    </style>
</head>
<body>
   <?php include '../modals/alert.php'; ?>

    <div class="ad-part" style="position:relative; width:100%; height:auto; overflow:hidden;">
        <video autoplay muted loop playsinline style="width:100%; height:auto; display:block;">
            <source src="../assets/vids/banner1.mp4" type="video/mp4">
        </video>
    </div>

    <div class="first-part-h">
        <div class="first-part-h-l">
            <a href="https://gonaraza.com">Digital Marketing</a>
            <a href="https://gonaraza.com/news">News</a>
            <a href="#">Magazine</a>
            <a href="#">Job Portal</a>
            <a href="#">Academia</a>
        </div>
        <div class="first-part-h-r">
            <a href="#"><img src="../assets/icons/follow1.svg"></a>
            <a href="https://wa.me/250782761021" target="_blank"><img src="../assets/icons/follow2.svg"></a>
            <a href="https://x.com/GonarazaCom" target="_blank"><img src="../assets/icons/follow3.svg"></a>
            <a href="https://www.instagram.com/gonaraza.com_"><img src="../assets/icons/follow4.svg"></a>
            <a href="https://www.tiktok.com/@gonaraza.com_official" target="_blank"><img src="../assets/icons/follow5.svg"></a>
            <a href="https://www.facebook.com/Gonaraza.comOfficial" target="_blank"><img src="../assets/icons/follow6.svg"></a>
            <a href="https://youtube.com/@onewebsellerbuyerconnect" target="_blank"><img src="../assets/icons/follow7.svg"></a>
        </div>
    </div>

    <!--
    <div class="second-part-h">
        <div class="second-part-h-logo"><img src="../assets/icons/logo.svg"></div>
        <div class="second-part-h-menus">
            <button id="OMG">
                <img src="../assets/icons/cc.svg">
                <span>All Categories</span>
                <img src="../assets/icons/drop2.svg">
            </button>
            <a href="#">Clothes & Apparel</a>
            <a href="#">Foods & Beverages</a>
        </div>
        <div class="second-part-h-links">
            <div class="second-part-h-link"><img src="../assets/icons/head1.svg"></div>
            <div class="second-part-h-link"><img src="../assets/icons/head2.svg"></div>
            <div class="dropdown custom-header-select-dropdown d-flex align-items-center">
                <button class="dropdown-toggle center" type="button" data-bs-toggle="dropdown"><img src="../assets/icons/ln2.svg"><span class="selected-option">EN</span></button>
                <ul class="dropdown-menu shadow">
                    <li><a class="dropdown-item active" href="#"><img src="../assets/icons/ln1.svg"><span>Kinyarwanda</span></a></li>
                    <li><a class="dropdown-item" href="#"><img src="../assets/icons/ln2.svg"><span>English</span></a></li>
                    <li><a class="dropdown-item" href="#"><img src="../assets/icons/ln3.svg"><span>French</span></a></li>
                </ul>
            </div>
           <div class="second-part-h-link user-h" onclick="window.location.href='/accounts/register-gonaraza?login=1'" style="cursor: pointer;"><img src="../assets/icons/head3.svg" alt=""></div>

            <div class="second-part-h-link open-cat" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample"><img src="../assets/icons/cc.svg"></div>
        </div>
    </div>
    -->

    <div class="second-part-h">
        <div class="second-part-h-logo"><a href="/gonaraza/academia/index"><img src="../assets/icons/logo.svg" alt="Gonaraza Academia"></a></div>
        <div class="second-part-h-menus">
            <a href="/gonaraza/academia/index">Home</a>
            <div class="dropdown courses-dropdown">
                <button id="coursesToggle" class="dropdown-toggle courses-toggle" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                    <span>Courses</span>
                    <img src="../assets/icons/drop1.svg" alt="">
                </button>
                <div class="dropdown-menu courses-dropdown-menu shadow">
                    <div class="courses-dropdown-left">
                        <div class="dropend course-group">
                            <button class="dropdown-item courses-left-link active" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <span class="courses-left-text">View all Courses</span>
                                <span class="courses-left-arrow"><img src="../assets/icons/right1.svg" alt=""></span>
                            </button>
                            <div class="dropdown-menu courses-submenu shadow">
                                <a class="dropdown-item courses-right-link courses-right-link-anchor" href="/gonaraza/academia/courses">Browse all Courses</a>
                                <button class="dropdown-item courses-right-link" type="button">Data &amp; Science</button>
                                <button class="dropdown-item courses-right-link" type="button">Career</button>
                                <button class="dropdown-item courses-right-link" type="button">IT and Software</button>
                                <button class="dropdown-item courses-right-link" type="button">Enterpreneurship</button>
                                <button class="dropdown-item courses-right-link soon" type="button"><span>Art &amp; Creation Design</span><small class="course-soon">Soon</small></button>
                                <button class="dropdown-item courses-right-link soon" type="button"><span>Partnerships</span><small class="course-soon">Soon</small></button>
                                <button class="dropdown-item courses-right-link" type="button">Mathematics &amp; Physics</button>
                            </div>
                        </div>

                        <div class="dropend course-group">
                            <button class="dropdown-item courses-left-link" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <span class="courses-left-text">Popular Courses</span>
                                <span class="courses-left-arrow"><img src="../assets/icons/right1.svg" alt=""></span>
                            </button>
                            <div class="dropdown-menu courses-submenu shadow">
                                <button class="dropdown-item courses-right-link active" type="button">IT and Software</button>
                                <button class="dropdown-item courses-right-link" type="button">Data &amp; Science</button>
                                <button class="dropdown-item courses-right-link" type="button">Career</button>
                                <button class="dropdown-item courses-right-link" type="button">Enterpreneurship</button>
                            </div>
                        </div>

                        <div class="dropend course-group">
                            <button class="dropdown-item courses-left-link" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <span class="courses-left-text">Free Courses</span>
                                <span class="courses-left-arrow"><img src="../assets/icons/right1.svg" alt=""></span>
                            </button>
                            <div class="dropdown-menu courses-submenu shadow">
                                <button class="dropdown-item courses-right-link active" type="button">Career</button>
                                <button class="dropdown-item courses-right-link" type="button">Data &amp; Science</button>
                                <button class="dropdown-item courses-right-link" type="button">Mathematics &amp; Physics</button>
                            </div>
                        </div>

                        <div class="dropend course-group">
                            <button class="dropdown-item courses-left-link" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <span class="courses-left-text">Applications &amp; Programs</span>
                                <span class="courses-left-arrow"><img src="../assets/icons/right1.svg" alt=""></span>
                            </button>
                            <div class="dropdown-menu courses-submenu shadow">
                                <button class="dropdown-item courses-right-link soon active" type="button"><span>Art &amp; Creation Design</span><small class="course-soon">Soon</small></button>
                                <button class="dropdown-item courses-right-link soon" type="button"><span>Partnerships</span><small class="course-soon">Soon</small></button>
                                <button class="dropdown-item courses-right-link" type="button">IT and Software</button>
                            </div>
                        </div>

                        <div class="dropend course-group">
                            <button class="dropdown-item courses-left-link" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <span class="courses-left-text">Online Courses</span>
                                <span class="courses-left-arrow"><img src="../assets/icons/right1.svg" alt=""></span>
                            </button>
                            <div class="dropdown-menu courses-submenu shadow">
                                <button class="dropdown-item courses-right-link active" type="button">Data &amp; Science</button>
                                <button class="dropdown-item courses-right-link" type="button">IT and Software</button>
                                <button class="dropdown-item courses-right-link" type="button">Career</button>
                                <button class="dropdown-item courses-right-link" type="button">Enterpreneurship</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <a href="/gonaraza/academia/journals">Journals &amp; Projects</a>
            <a href="#">Community Feed</a>
            <a href="/gonaraza/academia/rewards">Rewards</a>
        </div>
        <div class="second-part-h-links">
            <div class="second-part-h-link"><img src="../assets/icons/header-search.svg" alt=""></div>
            <div class="second-part-h-link"><img src="../assets/icons/header-grid.svg" alt=""></div>
            <div class="dropdown custom-header-select-dropdown d-flex align-items-center">
                <button class="dropdown-toggle center" type="button" data-bs-toggle="dropdown"><img src="../assets/icons/rwanda.svg"><span class="selected-option">KN</span></button>
                <ul class="dropdown-menu shadow">
                    <li><a class="dropdown-item active" href="#"><img src="../assets/icons/rwanda.svg"><span>Kinyarwanda</span></a></li>
                    <li><a class="dropdown-item" href="#"><img src="../assets/icons/ln2.svg"><span>English</span></a></li>
                    <li><a class="dropdown-item" href="#"><img src="../assets/icons/ln3.svg"><span>French</span></a></li>
                </ul>
            </div>
            <div class="second-part-h-link user-h" onclick="window.location.href='/accounts/register-gonaraza?login=1'" style="cursor: pointer;"><img src="../assets/icons/head3.svg" alt=""></div>
            <div class="second-part-h-link open-cat" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample"><img src="../assets/icons/cc.svg"></div>
        </div>
    </div>

    <div class="mega-menu">
        <div class="mega-menu-sidebar">
            <div class="mega-menu-sidebar-h">
                <h3>Categories</h3>
            </div>
            <div class="mega-menu-sidebar-l">
                <?php foreach($categories as $index => $cat): 
                     $icon = !empty($cat['icon_path']) ? $cat['icon_path'] : '../assets/icons/default.svg'; 
                ?>
                <a href="#" class="desktop-cat-trigger <?php echo ($index === 0) ? 'active' : ''; ?>" 
                   onmouseover="showDesktopSubcats(<?php echo $cat['category_id']; ?>, this)">
                    <img src="<?php echo htmlspecialchars($icon); ?>" alt="">
                    <span><?php echo htmlspecialchars($cat['cat_name']); ?></span>
                </a>
                <?php endforeach; ?>
            </div>
        </div>

        <div class="mega-menu-body">
            <div class="mega-menu-body-h">
                <h5>Subcategories</h5>
                <div>
                    <a href="accounts/register-gonaraza">Do you have business?</a>
                    <button onclick="window.location.href='accounts/register-gonaraza?login=1'">Get Started</button>
                </div>
            </div>
            
            <div class="mega-menu-body-items">
                <?php foreach($categories as $index => $cat): 
                    $cat_id = $cat['category_id'];
                    $my_subcats = isset($subcats_by_cat_id[$cat_id]) ? $subcats_by_cat_id[$cat_id] : [];
                    $displayStyle = ($index === 0) ? 'block' : 'none';
                ?>
                <div class="desktop-subcat-container" id="desktop-view-<?php echo $cat_id; ?>" style="display: <?php echo $displayStyle; ?>;">
                    <div style="display: flex; flex-wrap: wrap;">
                        <?php foreach($my_subcats as $sub): 
                             $subImg = !empty($sub['img']) ? $sub['img'] : '../assets/icons/favicon.svg';
                        ?>
                        <div class="mega-menu-body-item-sub" 
                             onclick="setActiveSubcategory(<?php echo $sub['subcategory_id']; ?>, '<?php echo addslashes($sub['sub_cat_name']); ?>', this)"
                             style="display: flex; margin: 10px;">
                            <div class="mega-menu-body-item-img">
                                <img src="<?php echo htmlspecialchars($subImg); ?>">
                            </div>
                            <div class="mega-menu-body-item-text">
                                <p><?php echo htmlspecialchars($sub['sub_cat_name']); ?></p>
                            </div>
                        </div>
                        <?php endforeach; ?>
                        
                        <?php if(empty($my_subcats)): ?>
                            <p style="padding:20px; color:#999;">No subcategories.</p>
                        <?php endif; ?>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>

        <div class="mega-menu-ending">
            <div class="mega-menu-ending-h">
                <div>
                    <h3>
                        <img class="ending-toggle" src="../assets/icons/ll.svg">
                        <span id="desktop-ending-title">Results</span>
                    </h3>
                </div>
                <div>
                    
                </div>
            </div>

            <div class="mega-menu-ending-b">
                <div class="mega-menu-ending-side">

                    <?php foreach ($categories as $cat): ?>
                        <?php
                            $cat_id = $cat['category_id'];
                            $subs = $subcats_by_cat_id[$cat_id] ?? [];
                        ?>
                        <div class="ending-subcats"
                             data-cat="<?php echo $cat_id; ?>"
                             style="display:none;">
                             
                            <?php foreach ($subs as $sub): ?>
                                <a
                                    class="ending-subcat-link"
                                    data-sub="<?php echo $sub['subcategory_id']; ?>"
                                    onclick="setActiveSubcategory(
                                        <?php echo $sub['subcategory_id']; ?>,
                                        '<?php echo addslashes($sub['sub_cat_name']); ?>',
                                        this
                                    )"
                                >
                                    <?php echo htmlspecialchars($sub['sub_cat_name']); ?>
                                </a>

                            <?php endforeach; ?>
                        </div>
                    <?php endforeach; ?>

                </div>

                <div class="mega-menu-body">
                    <div class="mega-menu-body-items">
                        <?php foreach($all_subcats_flat as $sub): 
                            $sub_id = $sub['subcategory_id'];
                            $my_ads = isset($ads_by_subcat_id[$sub_id]) ? $ads_by_subcat_id[$sub_id] : [];
                        ?>
                        <div class="desktop-ads-container" id="desktop-result-<?php echo $sub_id; ?>">
                            <?php if(empty($my_ads)): ?>
                                <p style="padding:20px; color:#777;">No ads found in this category.</p>
                            <?php else: ?>
                                <div style="display: flex; flex-wrap: wrap;">
                                    <?php foreach($my_ads as $ad): 
                                        $adImg = !empty($ad['file_name']) ? '../uploads/ads/' . $ad['file_name'] : '../assets/imgs/academia.JPG';
                                    ?>
                                    <a href="business-homepage?ref=<?php echo htmlspecialchars($ad['ad_uuid']); ?>" 
                                       class="mega-menu-body-item-sub" 
                                       style="display: flex; margin: 10px; text-decoration: none; color: inherit;">
                                        <div class="mega-menu-body-item-img">
                                            <img src="<?php echo htmlspecialchars($adImg); ?>" alt="">
                                        </div>
                                        <div class="mega-menu-body-item-text">
                                            <p><?php echo htmlspecialchars($ad['title']); ?></p>
                                        </div>
                                    </a>
                                    <?php endforeach; ?>
                                </div>
                            <?php endif; ?>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="phone-categories">
        <div class="phone-categories-list">
            <?php if(!empty($phone_quick_links)): ?>
                <?php foreach($phone_quick_links as $link): ?>
                    <a href="search_results?subcategory_id=<?php echo $link['subcategory_id']; ?>">
                        <p><?php echo htmlspecialchars($link['sub_cat_name']); ?></p>
                    </a>
                <?php endforeach; ?>
            <?php else: ?>
                <p>Clothes & Apparel</p>
                <p>Communication & Media Tools</p>
                <p>Vegetables</p>
                <p>Foods & Beverages</p>
            <?php endif; ?>
        </div>
        <button class="open-cat-btn"><img src="../assets/icons/castt.svg"></button>
    </div>

    <div class="categories-dropup-container">
        <div class="categories-dropup">
            <div class="categories-dropup-h"><button></button></div>
            <div class="categories-dropup-b">
                
                <div class="categories-dropup-b1">
                    <div class="categories-dropup-bh"><h4>Categories</h4></div>
                    <div class="categories-dropup-b1-c">
                        <?php foreach($categories as $cat): 
                            $icon = !empty($cat['icon_path']) ? $cat['icon_path'] : '../assets/icons/default.svg'; 
                        ?>
                        <p class="mobile-genesis-trigger" onclick="prepareExodus(<?php echo $cat['category_id']; ?>, '<?php echo addslashes($cat['cat_name']); ?>')">
                            <img src="<?php echo htmlspecialchars($icon); ?>" alt="">
                            <span><?php echo htmlspecialchars($cat['cat_name']); ?></span>
                        </p>
                        <?php endforeach; ?>
                    </div>
                </div>

                <div class="categories-dropup-b2">
                    <div class="categories-dropup-bh">
                        <button onclick="backToGenesis()"><img src="../assets/icons/bbr.svg"></button>
                        <h4 id="mobile-exodus-title">Select Category</h4>
                    </div>
                    <div class="categories-dropup-b2-c">
                        <?php foreach($categories as $cat): 
                             $cat_id = $cat['category_id'];
                             $my_subcats = isset($subcats_by_cat_id[$cat_id]) ? $subcats_by_cat_id[$cat_id] : [];
                        ?>
                        <div class="mobile-subcat-group" id="mob-sub-group-<?php echo $cat_id; ?>" style="display:none;">
                            <?php foreach($my_subcats as $sub): 
                                $subImg = !empty($sub['img']) ? $sub['img'] : '../assets/icons/favicon.svg';
                            ?>
                            <div onclick="showMobileAds(<?php echo $sub['subcategory_id']; ?>, '<?php echo addslashes($sub['sub_cat_name']); ?>')" class="cdb2-item" style="cursor: pointer;">
                                <div class="cdb2-item-l">
                                    <div class="cdb2-item-img"><img src="<?php echo htmlspecialchars($subImg); ?>"></div>
                                    <span><?php echo htmlspecialchars($sub['sub_cat_name']); ?></span>
                                </div>
                                <button><img src="../assets/icons/bbl.svg"></button>
                            </div>
                            <?php endforeach; ?>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <div class="categories-dropup-b3">
                    <div class="categories-dropup-bh">
                        <button onclick="backToExodus()"><img src="../assets/icons/bbr.svg"></button>
                        <h4 id="mobile-ads-title">Results</h4>
                    </div>
                    <div class="categories-dropup-b3-c">
                        <?php foreach($all_subcats_flat as $sub): 
                            $sub_id = $sub['subcategory_id'];
                            $my_ads = isset($ads_by_subcat_id[$sub_id]) ? $ads_by_subcat_id[$sub_id] : [];
                        ?>
                        <div class="mobile-ads-group" id="mob-ads-group-<?php echo $sub_id; ?>" style="display:none;">
                            <?php if(empty($my_ads)): ?>
                                <p style="padding:20px; text-align:center; color:#777;">No ads found in this category.</p>
                            <?php else: ?>
                                <?php foreach($my_ads as $ad): 
                                    $adImg = !empty($ad['file_name']) ? '../uploads/ads/' . $ad['file_name'] : '../assets/icons/favicon.svg'; 
                                ?>
                                <a href="business-homepage?ref=<?php echo htmlspecialchars($ad['ad_uuid']); ?>" class="cdb2-item" style="text-decoration: none; color: inherit;">
                                    <div class="cdb2-item-l">
                                        <div class="cdb2-item-img"><img src="<?php echo htmlspecialchars($adImg); ?>"></div>
                                        <span><?php echo htmlspecialchars($ad['title']); ?></span>
                                    </div>
                                    <button><img src="../assets/icons/bbl.svg"></button>
                                </a>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>

            </div>
        </div>
    </div>
    
    <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
        <div class="offcanvas-header">
            <div class="offcanvas-header-logo">
                <img src="../assets/icons/logo.svg">
            </div>
            <button onclick="window.location.href='/accounts/register-gonaraza?login=1'">
                <img src="../assets/icons/op.svg">
                <span>Sign In</span>
            </button>
        </div>
        <div class="offcanvas-body">
            <a href="https://gonaraza.com">Digital Marketing</a>
            <a href="https://gonaraza.com/news">News</a>
            <a href="#">Magazine</a>
            <a href="#">Job Portal</a>
            <div class="accordion" id="jobFilterAccordion">
                <div class="accordion-item">
                    <h2 class="accordion-header" id="jobTypeHeading1">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#jobTypeCollapse1" aria-expanded="false" aria-controls="jobTypeCollapse1">
                            Job Type
                        </button>
                    </h2>
                    <div id="jobTypeCollapse1" class="accordion-collapse collapse" aria-labelledby="jobTypeHeading1" data-bs-parent="#jobFilterAccordion">
                        <div class="accordion-body">
                            <a href="#">Home</a>
                            <a href="#">Jobs Categories</a>
                            <a href="#">Professional Jobs</a>
                            <a href="#">Job Seekers Profiles</a>
                        </div>
                    </div>
                </div>
            </div>
            <a href="#">Academia</a>
        </div>
    </div>

    <script src="../js/bootstrap.bundle.min.js"></script>

    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const currentPath = window.location.pathname.toLowerCase();

            function normalizePath(path) {
                if (!path) {
                    return '/';
                }

                let normalized = path.toLowerCase().replace(/\.php$/, '');
                if (normalized.length > 1) {
                    normalized = normalized.replace(/\/+$/, '');
                }
                return normalized;
            }

            const normalizedCurrentPath = normalizePath(currentPath);

            document.querySelectorAll('.courses-dropdown').forEach((coursesDropdown) => {
                const coursesToggle = coursesDropdown.querySelector('.courses-toggle');
                const leftLinks = coursesDropdown.querySelectorAll('.course-group > .courses-left-link');
                const submenus = coursesDropdown.querySelectorAll('.courses-submenu');

                function setActiveLeft(activeBtn) {
                    leftLinks.forEach((btn) => btn.classList.toggle('active', btn === activeBtn));
                }

                function hideAllSubmenus() {
                    submenus.forEach((submenu) => submenu.classList.remove('show'));
                }

                function activateRightDefaults(forLeftBtn) {
                    const submenu = forLeftBtn?.parentElement?.querySelector('.courses-submenu');
                    if (!submenu) return;
                    const rights = submenu.querySelectorAll('.courses-right-link');
                    rights.forEach((item, idx) => item.classList.toggle('active', idx === 0));
                }

                function openSubmenu(leftBtn) {
                    if (!leftBtn) return;
                    setActiveLeft(leftBtn);
                    hideAllSubmenus();
                    const submenu = leftBtn.parentElement?.querySelector('.courses-submenu');
                    if (submenu) {
                        submenu.classList.add('show');
                        activateRightDefaults(leftBtn);
                    }
                }

                leftLinks.forEach((btn) => {
                    btn.addEventListener('mouseenter', () => {
                        openSubmenu(btn);
                    });

                    if (btn.tagName === 'BUTTON') {
                        btn.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openSubmenu(btn);
                        });
                    }
                });

                coursesDropdown.addEventListener('shown.bs.dropdown', () => {
                    if (coursesToggle) coursesToggle.classList.add('active');
                    const current = coursesDropdown.querySelector('.courses-left-link.active') || leftLinks[0];
                    if (current) openSubmenu(current);
                });

                coursesDropdown.addEventListener('hidden.bs.dropdown', () => {
                    if (coursesToggle && !normalizedCurrentPath.includes('/academia/courses') && !normalizedCurrentPath.includes('/academia/course-part') && !normalizedCurrentPath.includes('/academia/read-contents')) {
                        coursesToggle.classList.remove('active');
                    }
                    hideAllSubmenus();
                    coursesDropdown.querySelectorAll('.courses-right-link').forEach(item => item.classList.remove('active'));
                });

                coursesDropdown.querySelectorAll('.courses-right-link').forEach((item) => {
                    item.addEventListener('click', () => {
                        const submenu = item.closest('.courses-submenu');
                        if (!submenu) return;
                        submenu.querySelectorAll('.courses-right-link').forEach((link) => link.classList.remove('active'));
                        item.classList.add('active');
                    });
                });

                if (normalizedCurrentPath.includes('/academia/courses') || normalizedCurrentPath.includes('/academia/course-part') || normalizedCurrentPath.includes('/academia/read-contents')) {
                    coursesToggle?.classList.add('active');
                }
            });

            const menuLinks = document.querySelectorAll('.second-part-h-menus > a');
            menuLinks.forEach((link) => {
                const href = link.getAttribute('href');
                if (!href || href === '#') {
                    return;
                }

                const normalizedHref = normalizePath(href);

                if (normalizedHref === '/gonaraza/academia/index' && (normalizedCurrentPath === '/gonaraza/academia' || normalizedCurrentPath === '/gonaraza/academia/index')) {
                    link.classList.add('active');
                    return;
                }

                if (normalizedCurrentPath === normalizedHref) {
                    link.classList.add('active');
                }
            });

            if (normalizedCurrentPath.includes('/academia/journals') || normalizedCurrentPath.includes('/academia/read-journal') || normalizedCurrentPath.includes('/academia/read-story') || normalizedCurrentPath.includes('/academia/author')) {
                const journalsLink = Array.from(menuLinks).find((link) => link.getAttribute('href') === '/gonaraza/academia/journals');
                journalsLink?.classList.add('active');
            }

            if (normalizedCurrentPath.includes('/academia/rewards')) {
                const rewardsLink = Array.from(menuLinks).find((link) => link.getAttribute('href') === '/gonaraza/academia/rewards');
                rewardsLink?.classList.add('active');
            }
        });
    </script>

    <script>

        function showDesktopSubcats(catId, element) {
            document.querySelectorAll('.desktop-cat-trigger').forEach(a => a.classList.remove('active'));
            element.classList.add('active');
            document.querySelectorAll('.desktop-subcat-container').forEach(div => div.style.display = 'none');
            document.getElementById('desktop-view-' + catId).style.display = 'block';
            document.querySelectorAll('.ending-subcats').forEach(div => div.style.display = 'none');
            const target = document.querySelector(`.ending-subcats[data-cat="${catId}"]`);
            if (target) target.style.display = 'block';
        }

        function setActiveSubcategory(subId, title) {
            document.getElementById('desktop-ending-title').innerText = title;
            document.querySelectorAll('.desktop-ads-container').forEach(div => div.style.display = 'none');
            const ads = document.getElementById('desktop-result-' + subId);
            if (ads) ads.style.display = 'block'; 
            document.querySelectorAll('.ending-subcat-link').forEach(a => a.classList.remove('active'));
            const activeLink = document.querySelector(`.ending-subcat-link[data-sub="${subId}"]`);
            if (activeLink) activeLink.classList.add('active');
            document.querySelector('.mega-menu-ending').classList.add('active');
        }

        function closeEndingPanel() {
            const ending = document.querySelector('.mega-menu-ending');
            if(ending) ending.classList.remove('active');
            document.querySelectorAll('.mega-menu-body-item-sub').forEach(el => el.classList.remove('active'));
        }

        const nEnding = document.querySelector('.mega-menu-ending');
        const endingToggle = document.querySelector('.ending-toggle');

        if (endingToggle) {
            endingToggle.addEventListener('click', function (e) {
                nEnding.classList.toggle('active');
            });
        }
    </script>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const husk = document.querySelector('.categories-dropup-container');
            const slate = document.querySelector('.categories-dropup');
            const nub = document.querySelector('.categories-dropup-h');
            const corpus = document.body;
            const spark = document.querySelector('.open-cat-btn');

            const stratum_genesis = document.querySelector('.categories-dropup-b1');
            const stratum_exodus = document.querySelector('.categories-dropup-b2');
            const stratum_revelation = document.querySelector('.categories-dropup-b3'); 

            let anchor_y = 0, drift_y = 0, is_tethered = false;

            function engage_apparatus() {
                husk.classList.add('open');
                corpus.classList.add('body-scroll-lock'); 
                manifest_stratum(stratum_genesis); 
            }
            function disengage_apparatus() {
                husk.classList.remove('open');
                corpus.classList.remove('body-scroll-lock');
                setTimeout(() => { slate.style.transform = ''; }, 300);
            }
            
            window.manifest_stratum = function(target_stratum) {
                document.querySelectorAll('.categories-dropup-b1, .categories-dropup-b2, .categories-dropup-b3').forEach(el => el.classList.remove('active-view'));
                target_stratum.classList.add('active-view');
                document.querySelector('.categories-dropup-b').scrollTop = 0;
            }

            window.prepareExodus = function(catId, catName) {
                const titleEl = document.getElementById('mobile-exodus-title');
                if(titleEl) titleEl.innerText = catName;
                document.querySelectorAll('.mobile-subcat-group').forEach(el => el.style.display = 'none');
                const group = document.getElementById('mob-sub-group-' + catId);
                if(group) group.style.display = 'block';
                manifest_stratum(stratum_exodus);
            }

            window.showMobileAds = function(subId, subName) {
                const titleEl = document.getElementById('mobile-ads-title');
                if(titleEl) titleEl.innerText = subName;
                
                document.querySelectorAll('.mobile-ads-group').forEach(el => el.style.display = 'none');
                const adGroup = document.getElementById('mob-ads-group-' + subId);
                if(adGroup) adGroup.style.display = 'block';
                
                manifest_stratum(stratum_revelation);
            }

            window.backToGenesis = function() { manifest_stratum(stratum_genesis); }
            window.backToExodus = function() { manifest_stratum(stratum_exodus); }

            if (spark) spark.addEventListener('click', (evt) => { evt.preventDefault(); engage_apparatus(); });
            husk.addEventListener('click', (evt) => { if (evt.target === husk) disengage_apparatus(); });
            
            nub.addEventListener('touchstart', (evt) => {
                anchor_y = evt.touches[0].clientY;
                is_tethered = true;
                slate.style.transition = 'none'; 
            }, { passive: true });
            nub.addEventListener('touchmove', (evt) => {
                if (!is_tethered) return;
                const delta = evt.touches[0].clientY - anchor_y;
                if (delta > 0) { drift_y = delta; slate.style.transform = `translateY(${drift_y}px)`; }
            }, { passive: true });
            nub.addEventListener('touchend', () => {
                is_tethered = false;
                slate.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'; 
                if (drift_y > 150) disengage_apparatus(); else slate.style.transform = `translateY(0)`; 
                drift_y = 0;
            });
        });
    </script>

<script>
    document.addEventListener("DOMContentLoaded", function () {
        const path = window.location.pathname.toLowerCase();
        const topLinks = document.querySelectorAll('.first-part-h-l a');
        const subHeaders = document.querySelectorAll('.second-part-h');

        function activate(index) {
            if (topLinks[index]) topLinks[index].classList.add('active');
            if (subHeaders[index]) subHeaders[index].classList.add('active');
        }

        activate(0);

        const phoneCat = document.querySelector('.phone-categories');
        const dropContainer = document.querySelector('.categories-dropup-container');
        
        if (phoneCat) phoneCat.classList.add('active-context');
        if (dropContainer) dropContainer.classList.add('active-context');

        if (path.startsWith('/news/')) activate(1);
        else if (path.startsWith('/careers/')) activate(3);
        else if (path.startsWith('/version5')) activate(2);
    });

    document.addEventListener('DOMContentLoaded', function () {

      const desktopOnly = window.matchMedia('(min-width: 768px)');
      let lastScrollTop = 0;
      const threshold = 20;

      function onScroll() {
        if (!desktopOnly.matches) return;

        const scrollY = Math.max(window.scrollY, 0);
        const delta = scrollY - lastScrollTop;

        const activeHeader = document.querySelector('.second-part-h.active');
        if (!activeHeader) return;

        activeHeader.style.transition = 'top 0.3s ease';

        if (delta > threshold) {
          activeHeader.style.top = '0px';
          lastScrollTop = scrollY;
        } 
        else if (delta < -threshold) {
          activeHeader.style.top = '70px';
          lastScrollTop = scrollY;
        }
      }

      window.addEventListener('scroll', onScroll);
    });
</script>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const firstCat = document.querySelector('.desktop-cat-trigger.active');
    if (firstCat) {
        const catId = firstCat.getAttribute('onmouseover')
            .match(/\d+/)[0];
        showDesktopSubcats(catId, firstCat);
    }
});
</script>

</body>
</html>