// document.querySelector("#year").innerText = new Date().getFullYear();
var notyf = new Notyf();

const btn = document.getElementById("menu-toggle");
const nav = document.getElementById("menu");
const closeIcon = document.getElementById("close-icon");
const openIcon = document.getElementById("open-icon");

btn.addEventListener("click", () => {
  nav.classList.toggle("hidden");
  closeIcon.classList.toggle("hidden");
  openIcon.classList.toggle("hidden");
});

const url = "http://127.0.0.1:5001";

//submit post
const postForm = document?.querySelector("#post-form");

postForm?.addEventListener("submit", sendPost);

async function sendPost(e) {
  e.preventDefault();
  const formData = new FormData(postForm);
  try {
    const res = await axios.post(`${url}/create`, formData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const { post } = res.data;
    if (res.status === 201) {
      renderPost(post);
      postForm.reset();
      document.querySelector(".content-error").textContent = "";
      notyf.success("Post created successfully");
    }
  } catch (error) {
    console.log(error);
    const contentError = error.response.data.error ?? {};

    document.querySelector(".content-error").textContent = contentError;
  }
}

//delete post
document.addEventListener("click", async (e) => {
  const targetElement = e.target;
  if (targetElement.classList.contains("delete-post")) {
    const postId = targetElement.getAttribute("data-post-id");
    const postItem = document.querySelector(
      `.post-item[data-post-item="${postId}"]`
    );
    try {
      const res = await axios.get(`${url}/delete/${postId}`);
      if (res.status === 201) {
        postItem.remove();
        notyf.success("Post deleted successfully");
      }
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  }
});

// Cache CSRF token once
const csrfToken = document
  .querySelector("meta[name='csrf-token']")
  .getAttribute("content");

document.addEventListener("click", async (e) => {
  const target = e.target;

  // Edit Post Click Handler
  if (target.classList.contains("edit-post")) {
    const postId = target.dataset.postId;
    const postItem = document.querySelector(
      `.post-item[data-post-item="${postId}"]`
    );
    const postContent = postItem.querySelector(".post-content").textContent;

    // Remove existing modal
    const existingModal = document.querySelector(".custom-modal");
    if (existingModal) existingModal.remove();

    // Create modal with classes instead of IDs
    const modalHtml = `
      <div class="custom-modal">
        <div class="custom-modal-content">
          <span class="custom-modal-close">&times;</span>
          <h2>Edit Post</h2>
          <div class="modal-msg text-success font-16 mb-3 text-center"></div>
          <form class="edit-post-form">
            <div class="form-group">
              <label>Post Content</label>
              <textarea class="form-control post-content-input" rows="3">${postContent}</textarea>
            </div>
            <button type="button" class="btn btn-primary js-update-post" data-post-id="${postId}">
              Update Post
            </button>
          </form>
        </div>
      </div>`;

    document.body.insertAdjacentHTML("beforeend", modalHtml);
    document.querySelector(".custom-modal").style.display = "block";
  }

  // Close Modal Handlers
  if (
    target.classList.contains("custom-modal-close") ||
    target.classList.contains("custom-modal")
  ) {
    const modal = target.closest(".custom-modal") || target;
    modal.style.display = "none";
    modal.remove();
  }

  // Update Post Handler
  if (target.classList.contains("js-update-post")) {
    const postId = target.dataset.postId;
    const modal = target.closest(".custom-modal");
    const content = modal.querySelector(".post-content-input").value;
    const postItem = document.querySelector(
      `.post-item[data-post-item="${postId}"]`
    );

    try {
      const res = await axios.post(
        `${url}/update/${postId}`,
        { content },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": csrfToken,
          },
        }
      );

      if (res.status === 201) {
        postItem.querySelector(".post-content").textContent = content;
        modal.remove();
        notyf.success("Post updated successfully");
      }
    } catch (error) {
      console.error("Update failed:", error);
      modal.querySelector(".modal-msg").textContent =
        "Error updating post. Please try again.";
    }
  }
});

function renderPost(post) {
  const postContainer = document.querySelector(".post-container");
  const template = `<div class="bg-white shadow-sm px-6 py-5 mt-2 post-item" data-post-item="${post.id}">
            <article>
              <p class="post-content">${post.content}</p>

              <div class="flex justify-between items-center mt-2">
                <p class="text-sm text-gray-500">
                  Posted by:
                  <span class="font-semibold">${post.user.name}</span>
                </p>
                <div class="space-x-2">
                  <button class="text-blue-500 hover:underline cursor-pointer edit-post" data-post-id="${post.id}">
                    Edit
                  </button>
                  <button class="text-red-500 hover:underline cursor-pointer delete-post" data-post-id="${post.id}">
                    Delete
                  </button>
                </div>
              </div>
            </article>
          </div>`;

  postContainer.insertAdjacentHTML("afterbegin", template);
}

//like post
document.addEventListener("click", async (e) => {
  const targetElement = e.target;
  if (targetElement.classList.contains("like-button")) {
    const postId = targetElement.dataset.postId;
    const isLiked = targetElement.textContent.trim() === "Unlike";
    const likeCount = targetElement.nextElementSibling.textContent;
    let updateLike = 0;

    let formData = new FormData();
    formData.append("post_id", postId);

    try {
      const res = await axios.post(`${url}/like`, formData, {
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
      });
      if (res.status === 200) {
        updateLike = isLiked
          ? parseInt(likeCount) - 1
          : parseInt(likeCount) + 1;
        targetElement.textContent = isLiked ? "Like" : "Unlike";
        targetElement.nextElementSibling.textContent = updateLike;
      }
    } catch (error) {
      console.log(error);
    }
  }
});
