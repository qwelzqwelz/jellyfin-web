import dom from "../../scripts/dom";
import "./banner.scss";
import ServerConnections from "../ServerConnections";

const global_status = {
    currentBanner: null,
};

class Banner {
    load(url, container) {
        const img = new Image();
        const self = this;

        img.onload = () => {
            if (self.isDestroyed) {
                return;
            }
            // container background
            container.classList.remove("hide");
            container.classList.add("bannerImage");
            container.style.backgroundImage = `url('${url}')`;
            container.setAttribute("data-url", url);
            // container inner image
            const image = document.createElement("img");
            image.setAttribute("src", url);
            container.innerHTML = "";
            container.appendChild(image);
        };
        img.src = url;
    }

    destroy() {
        this.isDestroyed = true;
    }
}

function getBannerContainer(page) {
    const result = page.querySelector("[id='itemBanner']");
    if (!result) {
        console.warn("Fail to get banner container, page=", page);
    }
    return result;
}

function setBannerImage(page, url) {
    if (global_status.currentBanner) {
        global_status.currentBanner.destroy();
        global_status.currentBanner = null;
    }

    const container = getBannerContainer(page);

    if (container) {
        const instance = new Banner();
        instance.load(url, container);
        global_status.currentBanner = instance;
    }
}

function getItemImageUrls(item, imageOptions) {
    imageOptions = imageOptions || {};

    const apiClient = ServerConnections.getApiClient(item.ServerId),
        banner_tag = item.ImageTags ? item.ImageTags.Banner : null,
        result = [];

    if (banner_tag) {
        result.push(
            apiClient.getScaledImageUrl(
                item.Id,
                Object.assign(imageOptions, {
                    type: "Banner",
                    tag: banner_tag,
                    maxWidth: dom.getScreenWidth(),
                    index: 0,
                })
            )
        );
    }

    return result;
}

export function setBanner(page, item_or_url, imageOptions) {
    let url = item_or_url;
    if (url && typeof url !== "string") {
        url = getItemImageUrls(item_or_url, imageOptions)[0];
    }

    if (url) {
        setBannerImage(page, url);
    } else {
        clearBanner(page);
    }
}

export function clearBanner(page) {
    if (global_status.currentBanner) {
        global_status.currentBanner.destroy();
        global_status.currentBanner = null;
    }

    const elem = getBannerContainer(page);
    if (elem) {
        elem.innerHTML = "";
        elem.classList.add("hide");
    }
}

export default {
    setBanner,
    clearBanner,
};
